/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useMemo, useState } from "react";
import { getExperiment_experimentBySlug } from "../../types/getExperiment";
import { NimbusDocumentationLinkTitle } from "../../types/globalTypes";

type DefaultDocumentationLink = {
  title: NimbusDocumentationLinkTitle | "";
  link: string;
};

export type AnnotatedDocumentationLink = DefaultDocumentationLink & {
  key: string;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string[]>;
};

export function useDocumentationLinks(
  experiment?: getExperiment_experimentBySlug | null,
) {
  const setup = useMemo(
    () => setupDocumentationLinks(experiment?.documentationLinks),
    [experiment],
  );
  const { initialDocumentationLinks } = setup;
  let { lastIndex } = setup;

  const [documentationLinks, setDocumentationLinks] = useState<
    AnnotatedDocumentationLink[]
  >(initialDocumentationLinks);

  const addDocumentationLink = useCallback(() => {
    setDocumentationLinks((existing) => {
      lastIndex++;
      return [...existing, emptyDocumentationLink(lastIndex)];
    });
  }, [lastIndex]);

  const removeDocumentationLink = useCallback(
    (documentationLink: AnnotatedDocumentationLink) => {
      setDocumentationLinks((existing) => {
        let remaining = existing.filter((d) => d.key !== documentationLink.key);

        if (!remaining.length) {
          lastIndex++;
          remaining = [emptyDocumentationLink(lastIndex)];
        }

        return remaining;
      });
    },
    [lastIndex],
  );

  return {
    documentationLinks,
    addDocumentationLink,
    removeDocumentationLink,
  };
}

export const setupDocumentationLinks = (
  existing?: getExperiment_experimentBySlug["documentationLinks"],
) => {
  const hasExisting = existing && existing.length > 0;
  const initialDocumentationLinks = hasExisting
    ? (existing! as DefaultDocumentationLink[]).map(annotateDocumentationLink)
    : [emptyDocumentationLink(0)];

  return {
    initialDocumentationLinks,
    lastIndex: initialDocumentationLinks.length - 1,
  };
};

export const emptyDocumentationLink = (index: number) => {
  return annotateDocumentationLink({ title: "", link: "" }, index);
};

export function annotateDocumentationLink(
  documentationLink: DefaultDocumentationLink,
  index: number,
) {
  return {
    ...documentationLink,
    key: `doc-link-${index}`,
    isValid: true,
    isDirty: false,
    errors: {},
  };
}

export function stripInvalidDocumentationLinks(data: Record<string, any>) {
  let documentationLinks: DefaultDocumentationLink[] = data.documentationLinks;

  if (!documentationLinks || !documentationLinks.length) {
    return data;
  }

  documentationLinks = documentationLinks.filter(
    (documentationLink) =>
      documentationLink.title.length && documentationLink.link.length,
  );

  return {
    ...data,
    documentationLinks,
  };
}
