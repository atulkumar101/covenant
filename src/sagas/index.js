// © 2018 BTL GROUP LTD -  This package is licensed under the MIT license https://opensource.org/licenses/MIT
const Immutable = require('seamless-immutable')
const {
  takeLatest,
  takeEvery,
  call,
  put,
  select
} = require('redux-saga').effects

const prefix = 'incomplete-example'

const fetchTimezoneDetails = () => {
  const url = selectors.getTimezoneApiUrl(initialState);
  return fetch(url).then(res => res.json()).catch(error => error);
}

export const actionTypes = {
  // Set the timestamp with a known value
  SET_TIMESTAMP: `${prefix}/SET_TIMESTAMP`,
  // Trigger a saga to obtain the current timestamp
  SAGA_UPDATE_TIMESTAMP: `${prefix}/SAGA_UPDATE_TIMESTAMP`,
  // Set the timezone
  SET_MY_TIMEZONE: `${prefix}/SET_MY_TIMEZONE`,
  // Trigger a saga to obtain details about the current timezone
  SAGA_TIMEZONE_DETAILS: `${prefix}/SAGA_TIMEZONE_DETAILS`,
  // Update the timezone details
  UPDATE_TIMEZONE_DETAILS: `${prefix}/UPDATE_TIMEZONE_DETAILS`,
  // Timezone API error
  TIMEZONE_API_ERROR: `${prefix}/TIMEZONE_API_ERROR`,
}

const actionCreators = {
  setTimestamp: timestamp => ({
    type: actionTypes.SET_TIMESTAMP,
    payload: {
      timestamp
    }
  }),

  sagaUpdateTimestamp: () => ({
    type: actionTypes.SAGA_UPDATE_TIMESTAMP,
    payload: {}
  }),

  setMyTimezone: abbreviation => ({
    type: actionTypes.SET_MY_TIMEZONE,
    payload: {
      abbreviation
    }
  }),

  sagaTimezoneDetails: () => ({
    type: actionTypes.SAGA_TIMEZONE_DETAILS,
    payload: {}
  }),

  timezoneApiSuccess: ({
    timeZoneName,
    utcOffset,
    isDayLightSavingsTime,
    currentDateTime,
    ordinalDate,
    dayOfTheWeek
  }) => ({
    type: actionTypes.UPDATE_TIMEZONE_DETAILS,
    payload: {
      timeZoneName,
      utcOffset,
      isDayLightSavingsTime,
      currentDateTime,
      ordinalDate,
      dayOfTheWeek
    }
  }),

  timezoneApiFailure: (url, serviceResponse) => ({
    type: actionTypes.TIMEZONE_API_ERROR,
    payload: {
      url,
      error: serviceResponse
    }
  }),

  timezoneApiError: (url, error) => ({
    type: actionTypes.TIMEZONE_API_ERROR,
    payload: {
      url,
      error
    }
  })
}

const selectors = {
  getTimestamp: state => state.getIn(['timestamp']),
  getTimezoneAbbreviation: state =>
    state.getIn(['timezone', 'abbreviation'], 'utc'),
  getTimezoneApiUrl: state => {
    const abbreviation = selectors.getTimezoneAbbreviation(state)
    return `http://worldclockapi.com/api/json/${abbreviation}/now`
  }
}

const initialState = Immutable.from({
  timestamp: undefined,
  timezone: {
    abbreviation: 'utc',
  },
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_TIMESTAMP:
      {
        const {
          timestamp
        } = action.payload
        return Number.isFinite(Number(timestamp)) ?
          state.set('timestamp', timestamp) : state
      }

    case actionTypes.SET_MY_TIMEZONE:
      {
        const {
          abbreviation
        } = action.payload
        return state.set('timezone', {
          abbreviation
        })
      }

    case actionTypes.UPDATE_TIMEZONE_DETAILS:
      {
        const {
          timeZoneName,
          utcOffset,
          isDayLightSavingsTime,
          currentDateTime,
          ordinalDate,
          dayOfTheWeek
        } = action.payload
        return state
          .setIn(['timezone', 'details'], {
            timeZoneName,
            utcOffset,
            isDayLightSavingsTime,
            currentDateTime,
            ordinalDate,
            dayOfTheWeek
          })
          .without('lastError')
      }

    case actionTypes.TIMEZONE_API_ERROR:
      {
        const {
          url,
          error
        } = action.payload
        return state
          .update('timezone', Immutable.without, 'details')
          .set('lastError', {
            url,
            error
          })
      }

    default:
      return state
  }
}

export function* rootSaga() {
  yield takeEvery(actionTypes.SAGA_UPDATE_TIMESTAMP, sagaUpdateTimestamp)
  yield takeLatest(actionTypes.SAGA_TIMEZONE_DETAILS, sagaTimezoneDetails)
}

function* sagaTimezoneDetails(action) {
  const url = selectors.getTimezoneApiUrl(initialState);
  try {
    // get result from api
    const timezoneDetails = yield call(fetchTimezoneDetails);
    const {
      timeZoneName,
      utcOffset,
      isDayLightSavingsTime,
      currentDateTime,
      ordinalDate,
      dayOfTheWeek
    } = timezoneDetails;
    const setTimezoneDetails = actionCreators.timezoneApiSuccess({
      timeZoneName,
      utcOffset,
      isDayLightSavingsTime,
      currentDateTime,
      ordinalDate,
      dayOfTheWeek
    });
    // throw 'bad'
    yield put(setTimezoneDetails);
  } catch (error) {
    console.log('Error: ', error)
    const setError = actionCreators.timezoneApiError(url, error);
    yield put(setError);
  }

}

function* sagaUpdateTimestamp(action) {
  // action is always the first argument when called from takeEvery
  console.log('SAGA: ', action)

  // Yield the result of a non-deterministic function
  const timestamp = yield call(Date.now)

  // Create an action containing the result
  const setTimestampAction = actionCreators.setTimestamp(timestamp)

  // Now the action is deterministic and can be handled by the reducer
  yield put(setTimestampAction)
}

export default {
  actionTypes,
  actionCreators,
  initialState,
  reducer,
  rootSaga,
  fetchTimezoneDetails,
  sagaTimezoneDetails
}