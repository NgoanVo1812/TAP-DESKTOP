// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ChangeEventHandler } from 'react';
import React, { forwardRef, useState } from 'react';

import type {
  InMemoryAttachmentDraftType,
  AttachmentDraftType,
} from '../types/Attachment';
import { isVideoAttachment, isImageAttachment } from '../types/Attachment';
import { AttachmentToastType } from '../types/AttachmentToastType';
import type { LocalizerType } from '../types/Util';

import { ToastCannotMixMultiAndNonMultiAttachments } from './ToastCannotMixMultiAndNonMultiAttachments';
import { ToastDangerousFileType } from './ToastDangerousFileType';
import { ToastFileSize } from './ToastFileSize';
import { ToastMaxAttachments } from './ToastMaxAttachments';
import { ToastUnsupportedMultiAttachment } from './ToastUnsupportedMultiAttachment';
import { ToastUnableToLoadAttachment } from './ToastUnableToLoadAttachment';
import type { HandleAttachmentsProcessingArgsType } from '../util/handleAttachmentsProcessing';
import {
  getSupportedImageTypes,
  getSupportedVideoTypes,
} from '../util/GoogleChrome';

export type PropsType = {
  addAttachment: (
    conversationId: string,
    attachment: InMemoryAttachmentDraftType
  ) => unknown;
  addPendingAttachment: (
    conversationId: string,
    pendingAttachment: AttachmentDraftType
  ) => unknown;
  conversationId: string;
  draftAttachments: ReadonlyArray<AttachmentDraftType>;
  i18n: LocalizerType;
  processAttachments: (options: HandleAttachmentsProcessingArgsType) => unknown;
  removeAttachment: (conversationId: string, filePath: string) => unknown;
};

export const CompositionUpload = forwardRef<HTMLInputElement, PropsType>(
  (
    {
      addAttachment,
      addPendingAttachment,
      conversationId,
      draftAttachments,
      i18n,
      processAttachments,
      removeAttachment,
    },
    ref
  ) => {
    const [toastType, setToastType] = useState<
      AttachmentToastType | undefined
    >();

    const onFileInputChange: ChangeEventHandler<
      HTMLInputElement
    > = async event => {
      const files = event.target.files || [];

      await processAttachments({
        addAttachment,
        addPendingAttachment,
        conversationId,
        files: Array.from(files),
        draftAttachments,
        onShowToast: setToastType,
        removeAttachment,
      });
    };

    function closeToast() {
      setToastType(undefined);
    }

    let toast;

    if (toastType === AttachmentToastType.ToastFileSize) {
      toast = (
        <ToastFileSize
          i18n={i18n}
          limit={100}
          onClose={closeToast}
          units="MB"
        />
      );
    } else if (toastType === AttachmentToastType.ToastDangerousFileType) {
      toast = <ToastDangerousFileType i18n={i18n} onClose={closeToast} />;
    } else if (toastType === AttachmentToastType.ToastMaxAttachments) {
      toast = <ToastMaxAttachments i18n={i18n} onClose={closeToast} />;
    } else if (
      toastType === AttachmentToastType.ToastUnsupportedMultiAttachment
    ) {
      toast = (
        <ToastUnsupportedMultiAttachment i18n={i18n} onClose={closeToast} />
      );
    } else if (
      toastType ===
      AttachmentToastType.ToastCannotMixMultiAndNonMultiAttachments
    ) {
      toast = (
        <ToastCannotMixMultiAndNonMultiAttachments
          i18n={i18n}
          onClose={closeToast}
        />
      );
    } else if (toastType === AttachmentToastType.ToastUnableToLoadAttachment) {
      toast = <ToastUnableToLoadAttachment i18n={i18n} onClose={closeToast} />;
    }

    const anyVideoOrImageAttachments = draftAttachments.some(attachment => {
      return isImageAttachment(attachment) || isVideoAttachment(attachment);
    });

    const acceptContentTypes = anyVideoOrImageAttachments
      ? [...getSupportedImageTypes(), ...getSupportedVideoTypes()]
      : null;

    return (
      <>
        {toast}
        <input
          hidden
          multiple
          onChange={onFileInputChange}
          ref={ref}
          type="file"
          accept={acceptContentTypes?.join(',')}
        />
      </>
    );
  }
);
