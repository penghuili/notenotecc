import { getUTCTimeNumber } from '../shared/js/getUTCTimeNumber';

export function generateNoteSortKey(timestamp) {
  return `note_${getUTCTimeNumber(timestamp)}_${Math.floor(Math.random() * 10000)}`;
}

export function generateAlbumSortKey(timestamp) {
  return `album_${getUTCTimeNumber(timestamp)}_${Math.floor(Math.random() * 10000)}`;
}
