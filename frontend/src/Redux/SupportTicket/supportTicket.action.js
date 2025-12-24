import api from "../api";
import * as types from "./supportTicket.actionType";

export const createTicketAction = (ticketData) => async (dispatch) => {
  dispatch({ type: types.CREATE_TICKET_REQUEST });
  try {
    const { data } = await api.post("/api/supportTicket", ticketData);
    dispatch({ type: types.CREATE_TICKET_SUCCESS, payload: data.data });
    console.log("Create ticket success:", data.data);
  } catch (error) {
    dispatch({ type: types.CREATE_TICKET_FAILURE, payload: error.message });
  }
};

export const getMyTicketsAction = (page = 1, limit = 20) => async (dispatch) => {
  dispatch({ type: types.GET_MY_TICKETS_REQUEST });
  try {
    const { data } = await api.get(`/api/supportTicket/me?page=${page}&limit=${limit}`);
    dispatch({ type: types.GET_MY_TICKETS_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: types.GET_MY_TICKETS_FAILURE, payload: error.message });
  }
};

export const getAllTicketsAction = (page = 1, limit = 20) => async (dispatch) => {
  dispatch({ type: types.GET_ALL_TICKETS_REQUEST });
  try {
    const { data } = await api.get(`/api/supportTicket?page=${page}&limit=${limit}`);
    dispatch({ type: types.GET_ALL_TICKETS_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: types.GET_ALL_TICKETS_FAILURE, payload: error.message });
  }
};

export const getTicketByIdAction = (id) => async (dispatch) => {
  dispatch({ type: types.GET_TICKET_BY_ID_REQUEST });
  try {
    const { data } = await api.get(`/api/supportTicket/${id}`);
    dispatch({ type: types.GET_TICKET_BY_ID_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: types.GET_TICKET_BY_ID_FAILURE, payload: error.message });
  }
};

export const updateTicketStatusAction = (id, status) => async (dispatch) => {
  dispatch({ type: types.UPDATE_TICKET_STATUS_REQUEST });
  try {
    const { data } = await api.patch(`/api/supportTicket/${id}/status`, { status });
    dispatch({ type: types.UPDATE_TICKET_STATUS_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: types.UPDATE_TICKET_STATUS_FAILURE, payload: error.message });
  }
};