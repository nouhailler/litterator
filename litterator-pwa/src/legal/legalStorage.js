import { LEGAL_NOTICE_VERSION } from './legalNoticeConfig.js';

export const LEGAL_NOTICE_ACKNOWLEDGED_KEY = 'legal_notice_acknowledged';
export const LEGAL_NOTICE_VERSION_KEY = 'legal_notice_acknowledged_version';

const getStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
};

export const hasAcknowledgedLegalNotice = (storage = getStorage()) => {
  if (!storage) {
    return true;
  }

  return storage.getItem(LEGAL_NOTICE_ACKNOWLEDGED_KEY) === 'true';
};

export const acknowledgeLegalNotice = (storage = getStorage(), version = LEGAL_NOTICE_VERSION) => {
  if (!storage) {
    return;
  }

  storage.setItem(LEGAL_NOTICE_ACKNOWLEDGED_KEY, 'true');
  storage.setItem(LEGAL_NOTICE_VERSION_KEY, version);
};

export const resetLegalNoticeAcknowledgement = (storage = getStorage()) => {
  if (!storage) {
    return;
  }

  storage.removeItem(LEGAL_NOTICE_ACKNOWLEDGED_KEY);
  storage.removeItem(LEGAL_NOTICE_VERSION_KEY);
};
