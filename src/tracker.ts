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
  INSERT INTO tracked_trains (user_id, train_id, train_number, train_name, date, departure_time, arrival_time, station_from_id, station_to_id, last_places_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  WHERE datetime(date || ' ' || departure_time) > datetime('now', '-3 hours')
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

export function updatePlaces(id: number, placesCount: number | null, notified: number): void {
  const db = getDb();
  db.prepare(UPDATE_PLACES).run(placesCount, notified, id);
}

export function startTracker(
  notifyFn: (userId: number, track: ITrackedTrain) => void,
  expiryFn: (userId: number, track: ITrackedTrain) => void,
): void {
  const MINUTES_15 = 15 * 60 * 1000;
  const EXPIRY_THRESHOLD = 3 * 60 * 60 * 1000;

  const check = async () => {
    try {
      const tracks = getActiveTracks();
      for (const track of tracks) {
        try {
          const departureTime = new Date(`${track.date.replace(/-/g, '/')}T${track.departure_time}`);
          if (Date.now() - departureTime.getTime() > EXPIRY_THRESHOLD) {
            console.log('[TRACKER] Expired track', track.train_number, 'for user', track.user_id);
            expiryFn(track.user_id, track);
            removeTrack(track.id, track.user_id);
            continue;
          }

          const dateStr = track.date;
          const url = `https://api.svrpk.ru/api/v1/trains/find-by/stations/${track.station_from_id}/${track.station_to_id}?date=${dateStr}&count=20`;
          console.log('[TRACKER] Checking train', track.train_number, 'date:', track.date);
          const { data } = await axios.get<{ data: { id: number; places_count: number | null }[] }>(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          });

          const trainInfo = data.data.find((t) => t.id === track.train_id);
          if (!trainInfo) continue;

          const places = trainInfo.places_count;
          console.log('[TRACKER] Train', track.train_number, 'places:', places);

          if (!track.notified && places != null && places > 0) {
            console.log('[TRACKER] Notification sent for', track.train_number, 'to user', track.user_id);
            notifyFn(track.user_id, track);
            updatePlaces(track.id, places, 1);
          } else {
            updatePlaces(track.id, places, track.notified ? 1 : 0);
          }
        } catch (err: any) {
          console.error(`[TRACKER] Per-track error trainId=${track.train_id}:`, err?.message ?? err);
        }
      }
    } catch (err: any) {
      console.error('[TRACKER] Overall check error:', err?.message ?? err);
    }
  };

  check();
  setInterval(check, MINUTES_15);
}
