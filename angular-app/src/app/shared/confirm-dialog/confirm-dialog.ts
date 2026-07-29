import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { AppButton } from '../button/button';

export interface ConfirmDialogData {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [AppButton],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class AppConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<boolean, AppConfirmDialog>>(DialogRef);

  protected close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
