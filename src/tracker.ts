import { getDb } from './database';
import axios from 'axios';

export interface ITrackedTrain {
  id: number;
  user_id: number;
  train_id: number;
  train_number: string;
  train_name: string;
  date: string;
  departure_time: string;
  arrival_time: string;
  station_from_id: number;
  station_to_id: number;
  last_places_count: number | null;
  notified: number;
  created_at: string;
}

const INSERT_TRACK = `
  INSERT INTO tracked_trains (user_id, train_id, train_number, train_name, date, departure_time, arrival_time, station_from_id, station_to_id, last_places_count, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
`;

const SELECT_BY_USER = `
  SELECT * FROM tracked_trains
  WHERE user_id = ?
  ORDER BY created_at DESC
`;

const SELECT_BY_ID = `
  SELECT * FROM tracked_trains
  WHERE id = ?
`;

const DELETE_TRACK = `
  DELETE FROM tracked_trains
  WHERE id = ? AND user_id = ?
`;

const SELECT_ACTIVE = `
  SELECT * FROM tracked_trains
  WHERE datetime(date || ' ' || departure_time) >= datetime('now', 'localtime', '-3 hours')
`;

const CHECK_TRACKED = `
  SELECT 1 FROM tracked_trains
  WHERE user_id = ? AND train_id = ? AND date = ? AND station_from_id = ? AND station_to_id = ?
`;

const UPDATE_PLACES = `
  UPDATE tracked_trains
  SET last_places_count = ?, notified = ?
  WHERE id = ?
`;

export function addTrack(
  userId: number,
  trainId: number,
  trainNumber: string,
  trainName: string,
  date: string,
  departureTime: string,
  arrivalTime: string,
  stationFromId: number,
  stationToId: number,
  placesCount: number | null,
): number {
  const db = getDb();
  const result = db.prepare(INSERT_TRACK).run(
    userId, trainId, trainNumber, trainName, date, departureTime, arrivalTime,
    stationFromId, stationToId, placesCount,
  );
  console.log(`[TRACKER] addTrack userId=${userId} trainId=${trainId} train=${trainNumber} date=${date}`);
  return Number(result.lastInsertRowid);
}

export function getUserTracks(userId: number): ITrackedTrain[] {
  const db = getDb();
  return db.prepare(SELECT_BY_USER).all(userId) as ITrackedTrain[];
}

export function getTrackById(id: number): ITrackedTrain | undefined {
  const db = getDb();
  return db.prepare(SELECT_BY_ID).get(id) as ITrackedTrain | undefined;
}

export function removeTrack(id: number, userId: number): boolean {
  const db = getDb();
  const result = db.prepare(DELETE_TRACK).run(id, userId);
  return result.changes > 0;
}

export function getActiveTracks(): ITrackedTrain[] {
  const db = getDb();
  return db.prepare(SELECT_ACTIVE).all() as ITrackedTrain[];
}

export function isTrainTracked(userId: number, trainId: number, date: string, fromId: number, toId: number): boolean {
  const db = getDb();
  const row = db.prepare(CHECK_TRACKED).get(userId, trainId, date, fromId, toId);
  return !!row;
}

export function updatePlaces(id: number, placesCount: number | null, notified: number): void {
  const db = getDb();
  db.prepare(UPDATE_PLACES).run(placesCount, notified, id);
}

export function startTracker(
  notifyFn: (userId: number, track: ITrackedTrain) => void,
  expiryFn: (userId: number, track: ITrackedTrain) => void,
): void {
  const TRACKER_INTERVAL = 10 * 1000;
  const EXPIRY_THRESHOLD = 3 * 60 * 60 * 1000;

  const check = async () => {
    try {
      const tracks = getActiveTracks();

      if (tracks.length > 0) {
        console.log(`[TRACKER] === Cycle: ${tracks.length} active track(s) ===`);
      }

      const groups = new Map<string, ITrackedTrain[]>();
      for (const track of tracks) {
        const key = `${track.station_from_id}:${track.station_to_id}:${track.date}`;
        const arr = groups.get(key) ?? [];
        arr.push(track);
        groups.set(key, arr);
      }

      for (const group of groups.values()) {
        const alive: ITrackedTrain[] = [];

        for (const track of group) {
          const createdAt = new Date(track.created_at);
          if (Date.now() - createdAt.getTime() > EXPIRY_THRESHOLD) {
            console.log('[TRACKER] Expired track', track.train_number, 'for user', track.user_id);
            expiryFn(track.user_id, track);
            removeTrack(track.id, track.user_id);
          } else {
            alive.push(track);
          }
        }

        if (alive.length === 0) continue;

        const sample = alive[0]!;
        const groupKey = `${sample.station_from_id}:${sample.station_to_id}:${sample.date}`;
        const url = `https://api.svrpk.ru/api/v1/trains/find-by/stations/${sample.station_from_id}/${sample.station_to_id}?date=${sample.date}&count=20`;

        try {
          const { data } = await axios.get<{ data: { id: number; places_count: number | null }[] }>(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          });

          for (const trainInfo of data.data) {
            const matching = alive.filter(t => t.train_id === trainInfo.id);
            if (matching.length === 0) continue;

            const places = trainInfo.places_count;
            for (const track of matching) {
              const prev = track.last_places_count;
              console.log(
                `[TRACKER] Train ${track.train_number} ${track.station_from_id}→${track.station_to_id} ${track.date} ${track.departure_time}` +
                ` | userId=${track.user_id} | places: ${places} (was: ${prev})`
              );

              if (!track.notified && places != null && places > 0) {
                console.log(`[TRACKER] 🔥 NOTIFY: Train ${track.train_number} ${track.station_from_id}→${track.station_to_id} ${track.date} | userId=${track.user_id} | places=${places}`);
                notifyFn(track.user_id, track);
                removeTrack(track.id, track.user_id);
              } else {
                updatePlaces(track.id, places, track.notified ? 1 : 0);
              }
            }
          }
        } catch (err: any) {
          console.error(`[TRACKER] Group error key=${groupKey}:`, err?.message ?? err);
        }
      }
    } catch (err: any) {
      console.error('[TRACKER] Overall check error:', err?.message ?? err);
    }
  };

  check();
  setInterval(check, TRACKER_INTERVAL);
}
