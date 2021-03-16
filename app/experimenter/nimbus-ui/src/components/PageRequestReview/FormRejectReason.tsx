/* istanbul ignore file until EXP-1055 & EXP-1062 done */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";

const FormRejectReason = ({
  isLoading,
  onSubmit,
  onCancel,
}: {
  isLoading: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}) => {
  const reason = "foo";
  const handleSubmitClick = () => onSubmit(reason);
  return (
    <Alert variant="warning">
      <Form className="text-body">
        <p>
          <strong>You are rejecting this review.</strong> Please add some
          comments:
        </p>
        <Form.Group controlId="reason">
          <Form.Control name="reason" as="textarea" rows={4} />
        </Form.Group>
        <div className="d-flex bd-highlight">
          <div>
            <button
              data-testid="launch-draft-to-preview"
              type="button"
              className="mr-2 btn btn-danger"
              disabled={isLoading}
              onClick={handleSubmitClick}
            >
              Reject
            </button>
            <button
              data-testid="start-launch-draft-to-review"
              type="button"
              className="btn btn-secondary"
              disabled={isLoading}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </Form>
    </Alert>
  );
};

export default FormRejectReason;
