<%--
  Copyright 2012 TopCoder Inc.
  Copyright 2018 The MITRE Corporation
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
--%>
 <%--
  - Description: This is the admin screening schedules page.
--%>
<%@ include file="/WEB-INF/pages/admin/includes/taglibs.jsp" %>

<!DOCTYPE html>
<html lang="en-US">
  <c:set var="title" value="Screening Schedules - Functions (Service Admin)"/>
  <h:handlebars template="includes/html_head" context="${pageContext}" />
  <body>
    <div id="wrapper">
      <h:handlebars template="includes/header" context="${pageContext}"/>
      <div id="mainContent">
        <div class="contentWidth">
          <div class="mainNav">
            <h:handlebars template="includes/logo" context="${pageContext}"/>
            <h:handlebars template="includes/banner" context="${pageContext}"/>
            <c:set var="activeTabFunctions" value="true"></c:set>
            <h:handlebars template="includes/nav" context="${pageContext}"/>
          </div>
          <div class="breadCrumb">
            Functions
          </div>
          <h1>Functions</h1>
          <div class="tabSection functionTab" id="applicationSection">
            <c:set var="functionsServiceActiveMenuScreeningSchedules" value="1"/>
            <h:handlebars template="admin/includes/functions_service_nav" context="${pageContext}" />
            <div class="tabContent" id="tabScreeningSchedules">
              <div id="screenSchedulePanel">
                <div class="pagination">
                  <div class="right">
                    <a class="purpleBtn changeScheduleBtn" href="${ctx}/admin/beginEditScreeningSchedule">Change Schedule</a>
                  </div>
                </div>
                <!-- /.pagination -->
                <div class="newApplicationPanel">
                  <div class="section">
                    <div class="wholeCol">
                      <div class="row">
                        <p class="borderBottom">The system will use the following schedule to automatically screen all pending applications that have not been manually scheduled for screening.</p>
                      </div>
                      <div class="row">
                        <label>Day of month to automatically rescreen</label>
                        <span class="marginLeft10">${schedule.dayOfMonth}</span>
                      </div>
                      <div class="row">
                        <label>Hour of day to automatically rescreen</label>
                        <span class="marginLeft10">${schedule.hourOfDay}:00</span>
                      </div>
                    </div>
                  </div>

                  <div class="bl"></div>
                  <div class="br"></div>
                </div>
              </div>
              <!-- /#screenSchedulePanel -->
            </div>
            <!-- /#tabScreeningSchedules -->
          </div>
        </div>
      </div>
      <!-- /#mainContent -->

      <h:handlebars template="includes/footer" context="${pageContext}"/>
    </div>
    <!-- /#wrapper -->
  </body>
</html>
