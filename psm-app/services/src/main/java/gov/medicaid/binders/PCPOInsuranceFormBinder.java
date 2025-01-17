/*
 * Copyright 2012, 2013 TopCoder, Inc.
 * Copyright 2018 The MITRE Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package gov.medicaid.binders;

import gov.medicaid.domain.model.ApplicationType;
import gov.medicaid.domain.model.AttachedDocumentsType;
import gov.medicaid.domain.model.DocumentNames;
import gov.medicaid.domain.model.DocumentType;
import gov.medicaid.domain.model.ProviderInformationType;
import gov.medicaid.domain.model.StatusMessageType;
import gov.medicaid.domain.model.StatusMessagesType;
import gov.medicaid.entities.Application;
import gov.medicaid.entities.CMSUser;
import gov.medicaid.entities.dto.FormError;

import javax.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * This binder handles the organization disclosure.
 */
public class PCPOInsuranceFormBinder extends BaseFormBinder {

    /**
     * The namespace for this form.
     */
    public static final String NAMESPACE = "_25_";

    /**
     * Creates a new binder.
     */
    public PCPOInsuranceFormBinder() {
        super(NAMESPACE);
    }

    /**
     * Binds the request to the model.
     * @param application the model to bind to
     * @param request the request containing the form fields
     *
     * @throws BinderException if the format of the fields could not be bound properly
     */
    public List<BinderException> bindFromPage(CMSUser user, ApplicationType applicationType, HttpServletRequest request) {
        ProviderInformationType provider = XMLUtility.nsGetProvider(applicationType);
        AttachedDocumentsType attachments = XMLUtility.nsGetAttachments(provider);

        String attachmentId = (String) request.getAttribute(NAMESPACE + "liabilityInsuranceId");
        if (attachmentId != null) {
            replaceDocument(attachments, attachmentId, DocumentNames.CERTIFICATE_OF_LIABILITY_INSURANCE.value());
        }

        attachmentId = (String) request.getAttribute(NAMESPACE + "compensationInsuranceId");
        if (attachmentId != null) {
            replaceDocument(attachments, attachmentId, DocumentNames.WORKERS_COMPENSATION_INSURANCE.value());
        }

        attachmentId = (String) request.getAttribute(NAMESPACE + "fidelityBondId");
        if (attachmentId != null) {
            replaceDocument(attachments, attachmentId, DocumentNames.FIDELITY_BOND.value());
        }

        attachmentId = (String) request.getAttribute(NAMESPACE + "suretyBondId");
        if (attachmentId != null) {
            replaceDocument(attachments, attachmentId, DocumentNames.SURETY_BOND.value());
        }
        return Collections.emptyList();
    }

    private void replaceDocument(AttachedDocumentsType attachments, String id, String value) {
        List<DocumentType> toRemove = new ArrayList<DocumentType>();
        List<DocumentType> attachment = attachments.getAttachment();
        for (DocumentType doc : attachment) {
            if (id.equals(doc.getObjectId())) {
                doc.setName(value);
            } else if (value.equals(doc.getName())) {
                toRemove.add(doc);
            }
        }

        attachments.getAttachment().removeAll(toRemove);
    }

    /**
     * Binds the model to the request attributes.
     * @param application the model to bind from
     * @param mv the model and view to bind to
     * @param readOnly true if the view is read only
     */
    public void bindToPage(CMSUser user, ApplicationType applicationType, Map<String, Object> mv, boolean readOnly) {
        attr(mv, "bound", "Y");
        ProviderInformationType provider = XMLUtility.nsGetProvider(applicationType);
        AttachedDocumentsType attachments = XMLUtility.nsGetAttachments(provider);
        List<DocumentType> attachment = attachments.getAttachment();
        for (DocumentType doc : attachment) {
            if (DocumentNames.CERTIFICATE_OF_LIABILITY_INSURANCE.value().equals(doc.getName())) {
                attr(mv, "liabilityInsuranceId", doc.getObjectId());
            } else if (DocumentNames.WORKERS_COMPENSATION_INSURANCE.value().equals(doc.getName())) {
                attr(mv, "compensationInsuranceId", doc.getObjectId());
            } else if (DocumentNames.FIDELITY_BOND.value().equals(doc.getName())) {
                attr(mv, "fidelityBondId", doc.getObjectId());
            } else if (DocumentNames.SURETY_BOND.value().equals(doc.getName())) {
                attr(mv, "suretyBondId", doc.getObjectId());
            }
        }
    }

    /**
     * Captures the error messages related to the form.
     * @param application the application that was validated
     * @param messages the messages to select from
     *
     * @return the list of errors related to the form
     */
    protected List<FormError> selectErrors(ApplicationType applicationType, StatusMessagesType messages) {
        List<FormError> errors = new ArrayList<FormError>();

        List<StatusMessageType> ruleErrors = messages.getStatusMessage();
        List<StatusMessageType> caughtMessages = new ArrayList<StatusMessageType>();

        synchronized (ruleErrors) {
            for (StatusMessageType ruleError : ruleErrors) {
                int count = errors.size();

                String path = ruleError.getRelatedElementPath();
                if (path == null) {
                    continue;
                }

                if (path.equals("/ProviderInformation/AttachedDocuments/Document[name=\"Certificate Of Liability Insurance\"]")) {
                    errors.add(createError("liabilityInsuranceId", ruleError.getMessage()));
                } else if (path.equals("/ProviderInformation/AttachedDocuments/Document[name=\"Workers Compensation Insurance\"]")) {
                    errors.add(createError("compensationInsuranceId", ruleError.getMessage()));
                } else if (path.equals("/ProviderInformation/AttachedDocuments/Document[name=\"Fidelity Bond\"]")) {
                    errors.add(createError("fidelityBondId", ruleError.getMessage()));
                } else if (path.equals("/ProviderInformation/AttachedDocuments/Document[name=\"Surety Bond\"]")) {
                    errors.add(createError("suretyBondId", ruleError.getMessage()));
                }

                if (errors.size() > count) { // caught
                    caughtMessages.add(ruleError);
                }
            }

            // so it does not get processed anywhere again
            ruleErrors.removeAll(caughtMessages);
        }

        return errors.isEmpty() ? NO_ERRORS : errors;
    }

    /**
     * Binds the fields of the form to the persistence model.
     *
     * @param applicationType the front end model
     * @param application the persistent model
     */
    public void bindToHibernate(ApplicationType applicationType, Application application) {
    }

    /**
     * Binds the fields of the persistence model to the front end xml.
     *
     * @param application the persistent model
     * @param applicationType the front end model
     */
    public void bindFromHibernate(Application application, ApplicationType applicationType) {
    }
}
