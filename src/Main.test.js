import configureMockStore from 'redux-mock-store'
import fetchMock from 'fetch-mock'
import expect from 'expect' // You can use any testing library
import createSagaMiddleware from 'redux-saga'
import {
  actionTypes,
  actionCreators,
  rootSaga
} from './sagas';

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()
const middlewares = [sagaMiddleware]
const mockStore = configureMockStore(middlewares)


describe('async actions', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('creates SAGA_TIMEZONE_DETAILS when fetching timezone details has been done', () => {

    fetchMock.getOnce('http://worldclockapi.com/api/json/utc/now', {
      body: {
        timezone: {
          abbreviation: 'utc'
        },
        lastError: {
          url: "http://worldclockapi.com/api/json/utc/now",
          error: "bad"
        },
        // details: {
        //   timeZoneName: 'UTC',
        //   utcOffset: '00:00:00',
        //   isDayLightSavingsTime: false,
        //   currentDateTime: '2018-11-22T06:29Z',
        //   ordinalDate: '2018-326',
        //   dayOfTheWeek: 'Thursday'
        // },
      },
      headers: {
        'content-type': 'application/json'
      }
    })

    const expectedActions = [
      {
        type: actionTypes.SAGA_TIMEZONE_DETAILS
      },
      {
        type: actionTypes.TIMEZONE_API_ERROR,
        payload: {
          url: "http://worldclockapi.com/api/json/utc/now",
          error: "bad"
        }
      },
      // {
      //   type: actionTypes.UPDATE_TIMEZONE_DETAILS,
      //   payload: {
      //     timeZoneName: 'UTC',
      //     utcOffset: '00:00:00',
      //     isDayLightSavingsTime: false,
      //     currentDateTime: '2018-11-22T06:29Z',
      //     ordinalDate: '2018-326',
      //     dayOfTheWeek: 'Thursday'
      //   }
      // },
    ]

    const store = mockStore({
      timezone: {
        abbreviation: 'utc'
      },
    })
    // then run the saga
    sagaMiddleware.run(rootSaga)
    store.dispatch({
      type: 'incomplete-example/SAGA_TIMEZONE_DETAILS',
    })
    expect(store.getActions()).toEqual(expectedActions)
  })
})