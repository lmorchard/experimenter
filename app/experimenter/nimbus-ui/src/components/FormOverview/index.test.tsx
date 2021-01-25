/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { DOCUMENTATION_LINKS_TOOLTIP } from ".";
import { mockExperimentQuery } from "../../lib/mocks";
import { NimbusDocumentationLinkTitle } from "../../types/globalTypes";
import { Subject } from "./mocks";

describe("FormOverview", () => {
  it("renders as expected", async () => {
    render(<Subject />);
    await act(async () =>
      expect(screen.getByTestId("FormOverview")).toBeInTheDocument(),
    );
  });

  it("calls onCancel when cancel clicked", async () => {
    const onCancel = jest.fn();
    render(<Subject {...{ onCancel }} />);

    const cancelButton = screen.getByText("Cancel");
    await act(async () => void fireEvent.click(cancelButton));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onNext when next clicked", async () => {
    const { experiment } = mockExperimentQuery("boo");
    const onNext = jest.fn();
    render(<Subject {...{ onNext, experiment }} />);

    const nextButton = screen.getByText("Next");
    await act(async () => void fireEvent.click(nextButton));
    expect(onNext).toHaveBeenCalled();
  });

  it("renders initial documentation links", () => {
    const { experiment } = mockExperimentQuery("boo", {
      documentationLinks: [
        {
          __typename: "NimbusDocumentationLinkType",
          title: NimbusDocumentationLinkTitle.DESIGN_DOC,
          link: "https://mozilla.com",
        },
        {
          __typename: "NimbusDocumentationLinkType",
          title: NimbusDocumentationLinkTitle.DS_JIRA,
          link: "https://mozilla.com",
        },
      ],
    });
    render(<Subject {...{ experiment }} />);
    expect(screen.getByTestId("tooltip-documentation-links")).toHaveAttribute(
      "data-tip",
      DOCUMENTATION_LINKS_TOOLTIP,
    );
    const linkEls = screen.queryAllByTestId("DocumentationLink");
    expect(linkEls).toHaveLength(experiment.documentationLinks!.length);
    linkEls.forEach((linkEl, index) => {
      const selected = linkEl.querySelector(
        "option[selected]",
      ) as HTMLSelectElement;
      expect(selected.value).toEqual(
        experiment.documentationLinks![index].title,
      );
    });
  });

  const fillOutNewForm = async (expected: Record<string, string>) => {
    for (const [labelText, fieldValue] of [
      ["Public name", expected.name],
      ["Hypothesis", expected.hypothesis],
      ["Application", expected.application],
    ]) {
      const fieldName = screen.getByLabelText(labelText);

      await act(async () => {
        fireEvent.click(fieldName);
        fireEvent.blur(fieldName);
      });
      if (labelText !== "Hypothesis") {
        expect(fieldName).toHaveClass("is-invalid");
        expect(fieldName).not.toHaveClass("is-valid");
      }

      await act(async () => {
        fireEvent.change(fieldName, { target: { value: fieldValue } });
        fireEvent.blur(fieldName);
      });
      expect(fieldName).not.toHaveClass("is-invalid");
      expect(fieldName).toHaveClass("is-valid");
    }
  };

  const getDocumentationLinkFields = (index: number) => {
    const testIdBase = `documentationLinks[${index}]`;
    const titleField = screen.queryByTestId(
      `${testIdBase}.title`,
    ) as HTMLInputElement;
    const linkField = screen.queryByTestId(
      `${testIdBase}.link`,
    ) as HTMLInputElement;
    const removeButton = screen.queryByTestId(
      `${testIdBase}.remove`,
    ) as HTMLButtonElement;
    return { titleField, linkField, removeButton };
  };

  const assertDocumentationLinkFields = (
    value: { title: string; link: string },
    index: number,
  ) => {
    const { titleField, linkField } = getDocumentationLinkFields(index);
    expect(titleField.value).toEqual(value.title);
    expect(linkField.value).toEqual(value.link);
  };

  const fillDocumentationLinkFields = (
    value: { title: NimbusDocumentationLinkTitle; link: string },
    index: number,
  ) => {
    const { titleField, linkField } = getDocumentationLinkFields(index);
    fireEvent.change(titleField, {
      target: { value: value.title },
    });
    fireEvent.change(linkField, {
      target: { value: value.link },
    });
  };

  const checkExistingForm = async (expected: Record<string, any>) => {
    for (const [labelText, fieldValue] of [
      ["Public name", expected.name],
      ["Hypothesis", expected.hypothesis],
      ["Public description", expected.publicDescription],
      ["Risk Mitigation Checklist Link", expected.riskMitigationLink],
      ["documentationLinks", expected.documentationLinks],
    ]) {
      if (labelText === "documentationLinks") {
        fieldValue.forEach(assertDocumentationLinkFields);
      } else {
        const fieldName = screen.getByLabelText(labelText) as HTMLInputElement;
        expect(fieldName.value).toEqual(fieldValue);
      }
    }
  };

  it("validates fields before allowing submit", async () => {
    const expected = {
      name: "Foo bar baz",
      hypothesis: "Some thing",
      application: "DESKTOP",
    };

    const onSubmit = jest.fn();
    render(<Subject {...{ onSubmit }} />);

    const submitButton = screen.getByText("Next");
    await act(async () => fillOutNewForm(expected));
    await act(async () => void fireEvent.click(submitButton));

    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual(expected);
  });

  it("with existing experiment data, asserts field values before allowing submit and next", async () => {
    const { experiment } = mockExperimentQuery("boo");

    const expected = {
      name: experiment.name,
      hypothesis: experiment.hypothesis as string,
      publicDescription: experiment.publicDescription as string,
      riskMitigationLink: experiment.riskMitigationLink as string,
      documentationLinks: experiment.documentationLinks as Record<string, any>,
    };

    const onSubmit = jest.fn();
    render(<Subject {...{ onSubmit, experiment, onNext: jest.fn() }} />);
    const submitButton = screen.getByText("Save");
    const nextButton = screen.getByText("Next");
    const nameField = screen.getByLabelText("Public name");

    expect(nextButton).toBeEnabled();

    await act(async () => checkExistingForm(expected));

    await act(async () => {
      fireEvent.change(nameField, { target: { value: "" } });
      fireEvent.blur(nameField);
    });

    // Update the name in the form and expected data
    const newName = "Name THIS";
    expected.name = newName;
    await act(async () => {
      fireEvent.change(nameField, {
        target: { value: newName },
      });
      fireEvent.blur(nameField);
    });
    expect(submitButton).toBeEnabled();

    await act(async () => void fireEvent.click(submitButton));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual(expected);
  });

  it("with missing public description, still allows submit", async () => {
    const { experiment } = mockExperimentQuery("boo");

    const onSubmit = jest.fn();
    render(<Subject {...{ onSubmit, experiment }} />);
    const descriptionField = screen.getByLabelText("Public description");
    const submitButton = screen.getByText("Save");

    await act(async () => {
      fireEvent.change(descriptionField, { target: { value: "" } });
      fireEvent.blur(descriptionField);
    });

    expect(submitButton).toBeEnabled();

    await act(async () => void fireEvent.click(submitButton));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("correctly renders, updates, filters, and deletes documentation links", async () => {
    const { experiment } = mockExperimentQuery("boo", {
      documentationLinks: [
        {
          __typename: "NimbusDocumentationLinkType",
          title: NimbusDocumentationLinkTitle.DS_JIRA,
          link: "https://bingo.bongo",
        },
      ],
    });

    const onSubmit = jest.fn();
    render(<Subject {...{ experiment, onSubmit }} />);
    const submitButton = screen.getByText("Save");
    const addButton = screen.getByText("+ Add Link");

    // Assert that the initial documentation link sets are rendered
    experiment.documentationLinks!.map(assertDocumentationLinkFields);

    // Update the values of the first set
    await act(async () => {
      experiment.documentationLinks![0] = {
        __typename: "NimbusDocumentationLinkType",
        title: NimbusDocumentationLinkTitle.ENG_TICKET,
        link: "https://ooga.booga",
      };
      fillDocumentationLinkFields(experiment.documentationLinks![0], 0);
    });

    // Add a new set and populate it
    await act(async () => void fireEvent.click(addButton));
    await act(async () => {
      experiment.documentationLinks!.push({
        __typename: "NimbusDocumentationLinkType",
        title: NimbusDocumentationLinkTitle.DESIGN_DOC,
        link: "https://boingo.oingo",
      });
      fillDocumentationLinkFields(experiment.documentationLinks![1], 1);
    });

    // Add a new set and PARTIALLY populate it
    // This set should be filtered out and therefor will
    // not be added to expected output
    await act(async () => void fireEvent.click(addButton));
    await act(async () =>
      fillDocumentationLinkFields(
        {
          title: NimbusDocumentationLinkTitle.DESIGN_DOC,
          link: "",
        },
        2,
      ),
    );

    // Add a new set, and populate it with the data from the second field
    await act(async () => void fireEvent.click(addButton));
    await act(async () => {
      fillDocumentationLinkFields(experiment.documentationLinks![1], 3);
    });

    // Now delete the second set
    await act(
      async () =>
        void fireEvent.click(getDocumentationLinkFields(1).removeButton),
    );

    expect(screen.queryAllByTestId("DocumentationLink").length).toEqual(
      // Add one because this array doesn't include the field that will be filtered out
      experiment.documentationLinks!.length + 1,
    );

    await act(async () => void fireEvent.click(submitButton));

    experiment.documentationLinks!.forEach((documentationLink, index) => {
      expect(onSubmit.mock.calls[0][0].documentationLinks[index].link).toEqual(
        documentationLink.link,
      );
    });

    // Now delete all the existing sets
    for (let i = 0; i < 3; i++) {
      await act(
        async () =>
          void fireEvent.click(getDocumentationLinkFields(0).removeButton),
      );
    }

    // Assert that we are left with one default set
    expect(screen.queryAllByTestId("DocumentationLink").length).toEqual(1);
    assertDocumentationLinkFields({ title: "", link: "" }, 0);
  });

  it("disables create submission when loading", async () => {
    const onSubmit = jest.fn();
    render(<Subject {...{ onSubmit, isLoading: true }} />);

    // Fill out valid form to ensure only isLoading prevents submission
    await act(
      async () =>
        void fillOutNewForm({
          name: "Foo bar baz",
          hypothesis: "Some thing",
          application: "DESKTOP",
        }),
    );

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Submitting");

    await act(async () => {
      fireEvent.click(submitButton);
      fireEvent.submit(screen.getByTestId("FormOverview"));
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("displays saving button when loading", async () => {
    const { experiment } = mockExperimentQuery("boo");
    const onSubmit = jest.fn();
    render(<Subject {...{ onSubmit, experiment, isLoading: true }} />);

    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toHaveTextContent("Saving");
  });

  it("displays an alert for overall submit error", async () => {
    const submitErrors = {
      "*": ["Big bad happened"],
    };
    render(<Subject {...{ submitErrors }} />);
    await act(async () =>
      expect(screen.getByTestId("submit-error")).toHaveTextContent(
        submitErrors["*"][0],
      ),
    );
  });

  it("displays feedback for per-field error", async () => {
    const submitErrors = {
      name: ["That name is terrible, man"],
    };
    render(<Subject {...{ submitErrors }} />);
    const errorFeedback = screen.getByText(submitErrors["name"][0]);
    await act(async () => {
      expect(errorFeedback).toHaveClass("invalid-feedback");
      expect(errorFeedback).toHaveAttribute("data-for", "name");
    });
  });

  it("displays warning icon when public description is not filled out and server requires it", async () => {
    Object.defineProperty(window, "location", {
      value: {
        search: "?show-errors",
      },
    });

    const { experiment } = mockExperimentQuery("boo");
    const isMissingField = jest.fn(() => true);
    render(<Subject {...{ isMissingField, experiment }} />);

    expect(isMissingField).toHaveBeenCalled();
    expect(screen.queryByTestId("missing-description")).toBeInTheDocument();
  });
});
