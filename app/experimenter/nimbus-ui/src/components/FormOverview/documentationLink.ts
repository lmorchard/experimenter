/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useMemo, useState } from "react";
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
  const [state, setState] = useState({
    lastIndex: 0,
    documentationLinks: [] as AnnotatedDocumentationLink[],
  });

  const stateAPI = useMemo(
    () => ({
      addDocumentationLink: () =>
        setState(({ lastIndex, documentationLinks }) => ({
          lastIndex: lastIndex + 1,
          documentationLinks: [
            ...documentationLinks,
            emptyDocumentationLink(lastIndex + 1),
          ],
        })),
      removeDocumentationLink: (
        documentationLink: AnnotatedDocumentationLink,
      ) =>
        setState(({ lastIndex, documentationLinks }) => {
          const remaining = documentationLinks.filter(
            (d) => d.key !== documentationLink.key,
          );
          if (remaining.length > 0) {
            return {
              lastIndex,
              documentationLinks: remaining,
            };
          }
          return {
            lastIndex: lastIndex + 1,
            documentationLinks: [emptyDocumentationLink(lastIndex + 1)],
          };
        }),
    }),
    [setState],
  );

  useEffect(() => {
    const documentationLinks = setupDocumentationLinks(
      experiment?.documentationLinks,
    );
    setState({
      lastIndex: documentationLinks.length,
      documentationLinks,
    });
  }, [experiment]);

  return { ...state, ...stateAPI };
}

export const setupDocumentationLinks = (
  existing?: getExperiment_experimentBySlug["documentationLinks"],
) => {
  const hasExisting = existing && existing.length > 0;
  const initialDocumentationLinks = hasExisting
    ? (existing! as DefaultDocumentationLink[]).map(annotateDocumentationLink)
    : [emptyDocumentationLink(0)];

  return initialDocumentationLinks;
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
