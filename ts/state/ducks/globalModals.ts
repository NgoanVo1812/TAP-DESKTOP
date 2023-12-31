// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ThunkAction } from 'redux-thunk';
import type { ExplodePromiseResultType } from '../../util/explodePromise';
import type { PropsForMessage } from '../selectors/message';
import type { SafetyNumberChangeSource } from '../../components/SafetyNumberChangeDialog';
import type { StateType as RootStateType } from '../reducer';
import type { UUIDStringType } from '../../types/UUID';
import * as SingleServePromise from '../../services/singleServePromise';
import { getMessageById } from '../../messages/getMessageById';
import { getMessagePropsSelector } from '../selectors/message';
import { useBoundActions } from '../../hooks/useBoundActions';

// State

export type ForwardMessagePropsType = Omit<PropsForMessage, 'renderingContext'>;
export type SafetyNumberChangedBlockingDataType = Readonly<{
  promiseUuid: UUIDStringType;
  source?: SafetyNumberChangeSource;
}>;

export type GlobalModalsStateType = Readonly<{
  contactModalState?: ContactModalStateType;
  forwardMessageProps?: ForwardMessagePropsType;
  isProfileEditorVisible: boolean;
  isSignalConnectionsVisible: boolean;
  isStoriesSettingsVisible: boolean;
  isWhatsNewVisible: boolean;
  profileEditorHasError: boolean;
  safetyNumberChangedBlockingData?: SafetyNumberChangedBlockingDataType;
  safetyNumberModalContactId?: string;
  addUserToAnotherGroupModalContactId?: string;
  userNotFoundModalState?: UserNotFoundModalStateType;
}>;

// Actions

const HIDE_CONTACT_MODAL = 'globalModals/HIDE_CONTACT_MODAL';
const SHOW_CONTACT_MODAL = 'globalModals/SHOW_CONTACT_MODAL';
const HIDE_WHATS_NEW_MODAL = 'globalModals/HIDE_WHATS_NEW_MODAL_MODAL';
const SHOW_WHATS_NEW_MODAL = 'globalModals/SHOW_WHATS_NEW_MODAL_MODAL';
const HIDE_UUID_NOT_FOUND_MODAL = 'globalModals/HIDE_UUID_NOT_FOUND_MODAL';
const SHOW_UUID_NOT_FOUND_MODAL = 'globalModals/SHOW_UUID_NOT_FOUND_MODAL';
const SHOW_STORIES_SETTINGS = 'globalModals/SHOW_STORIES_SETTINGS';
const HIDE_STORIES_SETTINGS = 'globalModals/HIDE_STORIES_SETTINGS';
const TOGGLE_FORWARD_MESSAGE_MODAL =
  'globalModals/TOGGLE_FORWARD_MESSAGE_MODAL';
const TOGGLE_PROFILE_EDITOR = 'globalModals/TOGGLE_PROFILE_EDITOR';
export const TOGGLE_PROFILE_EDITOR_ERROR =
  'globalModals/TOGGLE_PROFILE_EDITOR_ERROR';
const TOGGLE_SAFETY_NUMBER_MODAL = 'globalModals/TOGGLE_SAFETY_NUMBER_MODAL';
const TOGGLE_ADD_USER_TO_ANOTHER_GROUP_MODAL =
  'globalModals/TOGGLE_ADD_USER_TO_ANOTHER_GROUP_MODAL';
const TOGGLE_SIGNAL_CONNECTIONS_MODAL =
  'globalModals/TOGGLE_SIGNAL_CONNECTIONS_MODAL';
export const SHOW_SEND_ANYWAY_DIALOG = 'globalModals/SHOW_SEND_ANYWAY_DIALOG';
const HIDE_SEND_ANYWAY_DIALOG = 'globalModals/HIDE_SEND_ANYWAY_DIALOG';

export type ContactModalStateType = {
  contactId: string;
  conversationId?: string;
};

export type UserNotFoundModalStateType =
  | {
      type: 'phoneNumber';
      phoneNumber: string;
    }
  | {
      type: 'username';
      username: string;
    };

type HideContactModalActionType = {
  type: typeof HIDE_CONTACT_MODAL;
};

type ShowContactModalActionType = {
  type: typeof SHOW_CONTACT_MODAL;
  payload: ContactModalStateType;
};

type HideWhatsNewModalActionType = {
  type: typeof HIDE_WHATS_NEW_MODAL;
};

type ShowWhatsNewModalActionType = {
  type: typeof SHOW_WHATS_NEW_MODAL;
};

type HideUserNotFoundModalActionType = {
  type: typeof HIDE_UUID_NOT_FOUND_MODAL;
};

export type ShowUserNotFoundModalActionType = {
  type: typeof SHOW_UUID_NOT_FOUND_MODAL;
  payload: UserNotFoundModalStateType;
};

type ToggleForwardMessageModalActionType = {
  type: typeof TOGGLE_FORWARD_MESSAGE_MODAL;
  payload: ForwardMessagePropsType | undefined;
};

type ToggleProfileEditorActionType = {
  type: typeof TOGGLE_PROFILE_EDITOR;
};

export type ToggleProfileEditorErrorActionType = {
  type: typeof TOGGLE_PROFILE_EDITOR_ERROR;
};

type ToggleSafetyNumberModalActionType = {
  type: typeof TOGGLE_SAFETY_NUMBER_MODAL;
  payload: string | undefined;
};

type ToggleAddUserToAnotherGroupModalActionType = {
  type: typeof TOGGLE_ADD_USER_TO_ANOTHER_GROUP_MODAL;
  payload: string | undefined;
};

type ToggleSignalConnectionsModalActionType = {
  type: typeof TOGGLE_SIGNAL_CONNECTIONS_MODAL;
};

type ShowStoriesSettingsActionType = {
  type: typeof SHOW_STORIES_SETTINGS;
};

type HideStoriesSettingsActionType = {
  type: typeof HIDE_STORIES_SETTINGS;
};

export type ShowSendAnywayDialogActiontype = {
  type: typeof SHOW_SEND_ANYWAY_DIALOG;
  payload: SafetyNumberChangedBlockingDataType & {
    conversationsToPause: Map<string, Set<string>>;
  };
};

type HideSendAnywayDialogActiontype = {
  type: typeof HIDE_SEND_ANYWAY_DIALOG;
};

export type GlobalModalsActionType =
  | HideContactModalActionType
  | ShowContactModalActionType
  | HideWhatsNewModalActionType
  | ShowWhatsNewModalActionType
  | HideUserNotFoundModalActionType
  | ShowUserNotFoundModalActionType
  | HideStoriesSettingsActionType
  | ShowStoriesSettingsActionType
  | HideSendAnywayDialogActiontype
  | ShowSendAnywayDialogActiontype
  | ToggleForwardMessageModalActionType
  | ToggleProfileEditorActionType
  | ToggleProfileEditorErrorActionType
  | ToggleSafetyNumberModalActionType
  | ToggleAddUserToAnotherGroupModalActionType
  | ToggleSignalConnectionsModalActionType;

// Action Creators

export const actions = {
  hideContactModal,
  showContactModal,
  hideWhatsNewModal,
  showWhatsNewModal,
  hideUserNotFoundModal,
  showUserNotFoundModal,
  hideStoriesSettings,
  showStoriesSettings,
  hideBlockingSafetyNumberChangeDialog,
  showBlockingSafetyNumberChangeDialog,
  toggleForwardMessageModal,
  toggleProfileEditor,
  toggleProfileEditorHasError,
  toggleSafetyNumberModal,
  toggleAddUserToAnotherGroupModal,
  toggleSignalConnectionsModal,
};

export const useGlobalModalActions = (): typeof actions =>
  useBoundActions(actions);

function hideContactModal(): HideContactModalActionType {
  return {
    type: HIDE_CONTACT_MODAL,
  };
}

function showContactModal(
  contactId: string,
  conversationId?: string
): ShowContactModalActionType {
  return {
    type: SHOW_CONTACT_MODAL,
    payload: {
      contactId,
      conversationId,
    },
  };
}

function hideWhatsNewModal(): HideWhatsNewModalActionType {
  return {
    type: HIDE_WHATS_NEW_MODAL,
  };
}

function showWhatsNewModal(): ShowWhatsNewModalActionType {
  return {
    type: SHOW_WHATS_NEW_MODAL,
  };
}

function hideUserNotFoundModal(): HideUserNotFoundModalActionType {
  return {
    type: HIDE_UUID_NOT_FOUND_MODAL,
  };
}

function showUserNotFoundModal(
  payload: UserNotFoundModalStateType
): ShowUserNotFoundModalActionType {
  return {
    type: SHOW_UUID_NOT_FOUND_MODAL,
    payload,
  };
}

function hideStoriesSettings(): HideStoriesSettingsActionType {
  return { type: HIDE_STORIES_SETTINGS };
}

function showStoriesSettings(): ShowStoriesSettingsActionType {
  return { type: SHOW_STORIES_SETTINGS };
}

function toggleForwardMessageModal(
  messageId?: string
): ThunkAction<
  void,
  RootStateType,
  unknown,
  ToggleForwardMessageModalActionType
> {
  return async (dispatch, getState) => {
    if (!messageId) {
      dispatch({
        type: TOGGLE_FORWARD_MESSAGE_MODAL,
        payload: undefined,
      });
      return;
    }

    const message = await getMessageById(messageId);

    if (!message) {
      throw new Error(
        `toggleForwardMessageModal: no message found for ${messageId}`
      );
    }

    const messagePropsSelector = getMessagePropsSelector(getState());
    const messageProps = messagePropsSelector(message.attributes);

    dispatch({
      type: TOGGLE_FORWARD_MESSAGE_MODAL,
      payload: messageProps,
    });
  };
}

function toggleProfileEditor(): ToggleProfileEditorActionType {
  return { type: TOGGLE_PROFILE_EDITOR };
}

function toggleProfileEditorHasError(): ToggleProfileEditorErrorActionType {
  return { type: TOGGLE_PROFILE_EDITOR_ERROR };
}

function toggleSafetyNumberModal(
  safetyNumberModalContactId?: string
): ToggleSafetyNumberModalActionType {
  return {
    type: TOGGLE_SAFETY_NUMBER_MODAL,
    payload: safetyNumberModalContactId,
  };
}

function toggleAddUserToAnotherGroupModal(
  contactId?: string
): ToggleAddUserToAnotherGroupModalActionType {
  return {
    type: TOGGLE_ADD_USER_TO_ANOTHER_GROUP_MODAL,
    payload: contactId,
  };
}

function toggleSignalConnectionsModal(): ToggleSignalConnectionsModalActionType {
  return {
    type: TOGGLE_SIGNAL_CONNECTIONS_MODAL,
  };
}

function showBlockingSafetyNumberChangeDialog(
  conversationsToPause: Map<string, Set<string>>,
  explodedPromise: ExplodePromiseResultType<boolean>,
  source?: SafetyNumberChangeSource
): ThunkAction<void, RootStateType, unknown, ShowSendAnywayDialogActiontype> {
  const promiseUuid = SingleServePromise.set<boolean>(explodedPromise);

  return dispatch => {
    dispatch({
      type: SHOW_SEND_ANYWAY_DIALOG,
      payload: {
        conversationsToPause,
        promiseUuid,
        source,
      },
    });
  };
}

function hideBlockingSafetyNumberChangeDialog(): HideSendAnywayDialogActiontype {
  return {
    type: HIDE_SEND_ANYWAY_DIALOG,
  };
}

// Reducer

export function getEmptyState(): GlobalModalsStateType {
  return {
    isProfileEditorVisible: false,
    isSignalConnectionsVisible: false,
    isStoriesSettingsVisible: false,
    isWhatsNewVisible: false,
    profileEditorHasError: false,
  };
}

export function reducer(
  state: Readonly<GlobalModalsStateType> = getEmptyState(),
  action: Readonly<GlobalModalsActionType>
): GlobalModalsStateType {
  if (action.type === TOGGLE_PROFILE_EDITOR) {
    return {
      ...state,
      isProfileEditorVisible: !state.isProfileEditorVisible,
    };
  }

  if (action.type === TOGGLE_PROFILE_EDITOR_ERROR) {
    return {
      ...state,
      profileEditorHasError: !state.profileEditorHasError,
    };
  }

  if (action.type === SHOW_WHATS_NEW_MODAL) {
    return {
      ...state,
      isWhatsNewVisible: true,
    };
  }

  if (action.type === HIDE_WHATS_NEW_MODAL) {
    return {
      ...state,
      isWhatsNewVisible: false,
    };
  }

  if (action.type === HIDE_UUID_NOT_FOUND_MODAL) {
    return {
      ...state,
      userNotFoundModalState: undefined,
    };
  }

  if (action.type === SHOW_UUID_NOT_FOUND_MODAL) {
    return {
      ...state,
      userNotFoundModalState: {
        ...action.payload,
      },
    };
  }

  if (action.type === SHOW_CONTACT_MODAL) {
    return {
      ...state,
      contactModalState: action.payload,
    };
  }

  if (action.type === HIDE_CONTACT_MODAL) {
    return {
      ...state,
      contactModalState: undefined,
    };
  }

  if (action.type === TOGGLE_SAFETY_NUMBER_MODAL) {
    return {
      ...state,
      safetyNumberModalContactId: action.payload,
    };
  }

  if (action.type === TOGGLE_ADD_USER_TO_ANOTHER_GROUP_MODAL) {
    return {
      ...state,
      addUserToAnotherGroupModalContactId: action.payload,
    };
  }

  if (action.type === TOGGLE_FORWARD_MESSAGE_MODAL) {
    return {
      ...state,
      forwardMessageProps: action.payload,
    };
  }

  if (action.type === HIDE_STORIES_SETTINGS) {
    return {
      ...state,
      isStoriesSettingsVisible: false,
    };
  }

  if (action.type === SHOW_STORIES_SETTINGS) {
    return {
      ...state,
      isStoriesSettingsVisible: true,
    };
  }

  if (action.type === TOGGLE_SIGNAL_CONNECTIONS_MODAL) {
    return {
      ...state,
      isSignalConnectionsVisible: !state.isSignalConnectionsVisible,
    };
  }

  if (action.type === SHOW_SEND_ANYWAY_DIALOG) {
    const { promiseUuid, source } = action.payload;

    return {
      ...state,
      safetyNumberChangedBlockingData: {
        promiseUuid,
        source,
      },
    };
  }

  if (action.type === HIDE_SEND_ANYWAY_DIALOG) {
    return {
      ...state,
      safetyNumberChangedBlockingData: undefined,
    };
  }

  return state;
}
