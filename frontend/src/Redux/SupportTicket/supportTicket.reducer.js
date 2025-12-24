import * as types from "./supportTicket.actionType";

const initialState = {
  tickets: [],
  ticketDetail: null,
  loading: false,
  error: null,
  meta: null
};

export const supportTicketReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CREATE_TICKET_REQUEST:
    case types.GET_MY_TICKETS_REQUEST:
    case types.GET_ALL_TICKETS_REQUEST:
    case types.GET_TICKET_BY_ID_REQUEST:
    case types.UPDATE_TICKET_STATUS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.CREATE_TICKET_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        tickets: [action.payload, ...state.tickets] 
      };

    case types.GET_MY_TICKETS_SUCCESS:
    case types.GET_ALL_TICKETS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        tickets: action.payload.items,
        meta: action.payload.meta 
      };

    case types.GET_TICKET_BY_ID_SUCCESS:
      return { ...state, loading: false, ticketDetail: action.payload };

    case types.UPDATE_TICKET_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
        ticketDetail: state.ticketDetail?.id === action.payload.id ? action.payload : state.ticketDetail
      };

    case types.CREATE_TICKET_FAILURE:
    case types.GET_MY_TICKETS_FAILURE:
    case types.GET_ALL_TICKETS_FAILURE:
    case types.GET_TICKET_BY_ID_FAILURE:
    case types.UPDATE_TICKET_STATUS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};