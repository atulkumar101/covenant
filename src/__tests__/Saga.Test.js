import { call, put, select } from "redux-saga/effects";
import assert from 'assert';
import { selectors, fetchTimezoneDetails, sagaTimezoneDetails, actionTypes } from '../sagas';

describe('Timezone details Saga', () => {
  const generator = sagaTimezoneDetails();
  const url = `http://worldclockapi.com/api/json/utc/now`;
  const apiSuccessResponse = {
    "currentDateTime": "2018-11-26T09:04Z",
    "utcOffset": "00:00:00",
    "isDayLightSavingsTime": false,
    "dayOfTheWeek": "Monday",
    "timeZoneName": "UTC",
    "ordinalDate": "2018-330",
  }

  it('Should return url for api call', () => {
    assert.deepEqual(
      generator.next().value,
      select(selectors.getTimezoneApiUrl),
      'return fetchTimezoneDetails api call'
    );
  })

  it('Should return fetchTimezoneDetails api call', () => {
    assert.deepEqual(
      generator.next(url).value,
      call(fetchTimezoneDetails, url),
      'return fetchTimezoneDetails api call'
    );
  })

  it('Should return update timezone details action', () => {
    assert.deepEqual(
      generator.next(apiSuccessResponse).value,
      put({ type: actionTypes.UPDATE_TIMEZONE_DETAILS, payload: apiSuccessResponse }),
      'return update timezone details action'
    );
  })

  it('Should finish', () => {
    assert.equal(
      generator.next().done,
      true,
      'return completion'
    );
  })
})