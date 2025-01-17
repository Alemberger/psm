/*
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

package gov.medicaid.features.report.steps;

import gov.medicaid.features.report.ui.ApplicationsByReviewerPage;

import net.thucydides.core.annotations.Step;

public class ApplicationsByReviewerReportSteps {
    private ApplicationsByReviewerPage applicationsByReviewerPage;

    @Step
    public void searchApplicationsInReviewBetween(String d1, String d2) {
        applicationsByReviewerPage.submitSearch(d1, d2);
    }

    @Step
    public void searchApplicationsInReviewWithClearedDates() {
        applicationsByReviewerPage.clearDates();
        applicationsByReviewerPage.clickViewReportButton();
    }

    @Step
    public void checkNoApplicationsByReviewerResults() {
        applicationsByReviewerPage.checkHasNoResults();
    }

    @Step
    public void checkApplicationsByReviewerHasResults() {
        applicationsByReviewerPage.checkHasResults();
    }

    @Step
    public void downloadApplicationsByReviewerReport() {
        applicationsByReviewerPage.click$(".downloadApplicationsByReviewerLink");
    }

    @Step
    public void clickOnApplication(int applicationId) {
        applicationsByReviewerPage.clickOnApplication(applicationId);
    }
}
