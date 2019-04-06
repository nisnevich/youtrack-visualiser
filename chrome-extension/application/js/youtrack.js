var YouTrack = (function () {

  let authToken;

  chrome.storage.sync.get('authToken', function (data) {
    authToken = data.authToken;
  });

  let resultsList;
  let visitedIssueIds;
  let issuesToVisitCounter;
  let maxDepthLevel;

  function loadIssues(rootIssueId, depthLevel, callback) {
    resultsList = [];
    visitedIssueIds = [rootIssueId];
    maxDepthLevel = depthLevel;
    issuesToVisitCounter = 1;
    loadIssuesInternal(rootIssueId, callback, 0);
  }

  function loadIssuesInternal(rootIssueId, callback, depth) {
    let getUrl = function (rootIssueId) {
      return `https://youtrack.jetbrains.com/rest/issue/${rootIssueId}?wikifyDescription=true`;
    };

    let deferred = $.ajax({
      url: getUrl(rootIssueId),
      type: 'GET',
      dataType: 'json',
      beforeSend: function (xhr) {
        if (authToken) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
        }
      },
      success: function (issue) {
        issue.depthLevel = depth;
        resultsList.push(issue);

        // youtrack returns fields as list
        let fieldsList = issue.field;
        issue.field = {};
        for (let field of fieldsList) {
          issue.field[field.name] = field;
        }
        if (depth === maxDepthLevel) {
          return;
        }
        for (let issueLink of issue.field.links.value) {
          if (visitedIssueIds.indexOf(issueLink.value) > -1) {
            continue;
          }
          issuesToVisitCounter++;
          visitedIssueIds.push(rootIssueId);
          loadIssuesInternal(issueLink.value, callback, 1 + depth);
        }
      },
      error: function (xhr, status, object) {
        console.error("Unable to load issues: " + status);
        console.error(xhr.responseJSON);
      },
      complete: function () {
        issuesToVisitCounter--;
        if (issuesToVisitCounter === 0) {
          localStorage["nodesAmount"] = resultsList.length;
          callback(resultsList);
        }
      }
    });
  }

  let testObject = {
    "id": "IDEA-84051",
    "entityId": "25-398271",
    "jiraId": null,
    "field": [
      {
        "name": "projectShortName",
        "value": "IDEA"
      },
      {
        "name": "summary",
        "value": "Tab management usability issues"
      },
      {
        "name": "reporterFullName",
        "value": "Vlad"
      },
      {
        "name": "created",
        "value": "1333527885180"
      },
      {
        "name": "numberInProject",
        "value": "84051"
      },
      {
        "name": "description",
        "value": "<div class=\"wiki text prewrapped\">The standart of tab management would be Google Chrome i think, so you may want to use it as example.<br/><br/>1. When the tab is in the draggable state (the mouse button is not released), when i hover over a tab bar, i should see a preview where the tab will be placed.<br/>2. The tab is detached only by dragging up/down, also should detach on right/left. When it is dragged r/l inside the tab bar bounds - it changes position, outside - the tab detaches from the tab bar.<br/>3. When the split view has only <strong>one tab</strong>, and it is detached, you can&#39;t return the tab to that split view, when i release the mouse button, to return the tab, it goes to the main window, and the split view closes.<br/>4. The tabs detached from the tab bar can be placed only at the end when attached back.</div>\n"
      },
      {
        "name": "updaterFullName",
        "value": "Elena Pogorelova"
      },
      {
        "name": "reporterName",
        "value": "Vlad.Vladovi4.Vladov"
      },
      {
        "name": "commentsCount",
        "value": "4"
      },
      {
        "name": "updaterName",
        "value": "lena"
      },
      {
        "name": "markdown",
        "value": "false"
      },
      {
        "name": "wikified",
        "value": "true"
      },
      {
        "name": "votes",
        "value": "2"
      },
      {
        "name": "updated",
        "value": "1549654085597"
      },
      {
        "name": "links",
        "value": [
          {
            "value": "IDEA-75436",
            "type": "Relates",
            "role": "relates to"
          },
          {
            "value": "IDEA-84887",
            "type": "Relates",
            "role": "relates to"
          },
          {
            "value": "IDEA-107376",
            "type": "Relates",
            "role": "relates to"
          },
          {
            "value": "IDEA-182462",
            "type": "Relates",
            "role": "relates to"
          },
          {
            "value": "IDEA-205291",
            "type": "Relates",
            "role": "relates to"
          },
          {
            "value": "IDEA-206974",
            "type": "Relates",
            "role": "relates to"
          }
        ]
      },
      {
        "name": "Type",
        "value": [
          "Usability Problem"
        ],
        "valueId": [
          "Usability Problem"
        ],
        "color": null
      },
      {
        "name": "Priority",
        "value": [
          "Major"
        ],
        "valueId": [
          "Major"
        ],
        "color": {
          "bg": "#ffee9c",
          "fg": "#b45f06"
        }
      },
      {
        "name": "State",
        "value": [
          "Submitted"
        ],
        "valueId": [
          "Submitted"
        ],
        "color": null
      },
      {
        "name": "Subsystem",
        "value": [
          "User Interface"
        ],
        "valueId": [
          "User Interface"
        ],
        "color": null
      },
      {
        "name": "Verified",
        "value": [
          "No"
        ],
        "valueId": [
          "No"
        ],
        "color": null
      },
      {
        "name": "Triaged",
        "value": [
          "Yes"
        ],
        "valueId": [
          "Yes"
        ],
        "color": null
      },
      {
        "name": "Assignee",
        "value": [
          {
            "value": "Vassiliy.Kudryashov",
            "fullName": "Vassiliy Kudryashov"
          }
        ]
      },
      {
        "name": "voterName",
        "value": [
          {
            "value": "Kirill.Likhodedov",
            "fullName": "Kirill Likhodedov"
          },
          {
            "value": "axel.costas.pena",
            "fullName": "Áxel Costas Pena"
          }
        ]
      }
    ],
    "comment": [
      {
        "id": "27-316010",
        "author": "Vlad.Vladovi4.Vladov",
        "authorFullName": "Vlad",
        "issueId": "IDEA-84051",
        "parentId": null,
        "deleted": false,
        "jiraId": null,
        "text": "<div class=\"wiki text prewrapped\">Also how to change focus from one split view to another via a keyboard shortcut? Ctrl+Tab switches between tabs, not split views.</div>\n",
        "shownForIssueAuthor": false,
        "created": 1333528104286,
        "updated": 0,
        "permittedGroup": null,
        "markdown": false,
        "replies": []
      },
      {
        "id": "27-316036",
        "author": "LazyOne",
        "authorFullName": "Andriy Bazanov",
        "issueId": "IDEA-84051",
        "parentId": null,
        "deleted": false,
        "jiraId": null,
        "text": "<div class=\"wiki text prewrapped\"><a href=\"https://youtrack.jetbrains.com:443/users/Random\" title=\"Random\" data-user-id=\"11-51904\">Alexej Barzykin</a> Stuff <br/>Windows | Editor Tabs | Goto Next Splitter<br/>Windows | Editor Tabs | Goto Previous Splitter</div>\n",
        "shownForIssueAuthor": false,
        "created": 1333530776973,
        "updated": 0,
        "permittedGroup": null,
        "markdown": false,
        "replies": []
      },
      {
        "id": "27-316057",
        "author": "Vlad.Vladovi4.Vladov",
        "authorFullName": "Vlad",
        "issueId": "IDEA-84051",
        "parentId": null,
        "deleted": false,
        "jiraId": null,
        "text": "<div class=\"wiki text prewrapped\">Windows | Editor Tabs | Goto Next Splitter actually is the shortcut i said, Ctrl+tab, i just should have release the button quicker.  thanks :)</div>\n",
        "shownForIssueAuthor": false,
        "created": 1333532190162,
        "updated": 0,
        "permittedGroup": null,
        "markdown": false,
        "replies": []
      },
      {
        "id": "27-763274",
        "author": "Olga.Berdnikova",
        "authorFullName": "Olga Berdnikova",
        "issueId": "IDEA-84051",
        "parentId": null,
        "deleted": false,
        "jiraId": null,
        "text": "<div class=\"wiki text prewrapped\">Agree with all points here.</div>\n",
        "shownForIssueAuthor": false,
        "created": 1404740708561,
        "updated": 0,
        "permittedGroup": "idea-developers",
        "markdown": false,
        "replies": []
      }
    ],
    "tag": [
      {
        "value": "link-visualiser-todo",
        "cssClass": "c0"
      }
    ]
  };

  let testObject2 = {
    "numberInProject": 106716,
    "project": {
      "shortName": "IDEA",
      "$type": "jetbrains.charisma.persistent.Project"
    },
    "tags": [
      {
        "name": "mac",
        "$type": "jetbrains.charisma.persistent.issueFolders.IssueTag"
      },
      {
        "name": "linux",
        "$type": "jetbrains.charisma.persistent.issueFolders.IssueTag"
      },
      {
        "name": "windows",
        "$type": "jetbrains.charisma.persistent.issueFolders.IssueTag"
      },
      {
        "name": "pain-point",
        "$type": "jetbrains.charisma.persistent.issueFolders.IssueTag"
      },
      {
        "name": "FocusLost",
        "$type": "jetbrains.charisma.persistent.issueFolders.IssueTag"
      },
      {
        "name": "FocusCritical",
        "$type": "jetbrains.charisma.persistent.issueFolders.IssueTag"
      }
    ],
    "votes": 596,
    "summary": "Idea takes away focus after first window activation",
    "attachments": [
      {
        "id": "74-201291",
        "$type": "jetbrains.charisma.persistent.issue.IssueAttachment"
      },
      {
        "id": "74-332725",
        "$type": "jetbrains.charisma.persistent.issue.IssueAttachment"
      },
      {
        "id": "74-379094",
        "$type": "jetbrains.charisma.persistent.issue.IssueAttachment"
      },
      {
        "id": "74-565073",
        "$type": "jetbrains.charisma.persistent.issue.IssueAttachment"
      }
    ],
    "links": [
      {
        "linkType": {
          "directed": false,
          "targetToSource": "relates to",
          "sourceToTarget": "relates to",
          "name": "Relates",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [
          {
            "id": "25-696860",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-831759",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-835403",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-836305",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-962741",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1013113",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1493290",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1493384",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1623504",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-348378",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-553875",
            "$type": "jetbrains.charisma.persistent.Issue"
          }
        ],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "depends on",
          "sourceToTarget": "is required for",
          "name": "Depend",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "depends on",
          "sourceToTarget": "is required for",
          "name": "Depend",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "duplicates",
          "sourceToTarget": "is duplicated by",
          "name": "Duplicate",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [
          {
            "id": "25-174290",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-179308",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-320407",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-553875",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-585096",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-587536",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-599607",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-614237",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-669964",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-677228",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-696146",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-703274",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-716752",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-730087",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-743025",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-748026",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-775982",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-793447",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-807989",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-831759",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-848856",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-882741",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1013113",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1144918",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1297873",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1467629",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1572628",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1623504",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1626954",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1704398",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1752623",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1767203",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1773820",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1773824",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1781088",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1801328",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1845659",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1966076",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1977863",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1979738",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-1992881",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2001224",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2029059",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2064683",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2064705",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2069806",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2075505",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2084870",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2121176",
            "$type": "jetbrains.charisma.persistent.Issue"
          }
        ],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "duplicates",
          "sourceToTarget": "is duplicated by",
          "name": "Duplicate",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "subtask of",
          "sourceToTarget": "parent for",
          "name": "Subtask",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [
          {
            "id": "25-2180168",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2180204",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2180322",
            "$type": "jetbrains.charisma.persistent.Issue"
          },
          {
            "id": "25-2180387",
            "$type": "jetbrains.charisma.persistent.Issue"
          }
        ],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "subtask of",
          "sourceToTarget": "parent for",
          "name": "Subtask",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [
          {
            "id": "25-2196404",
            "$type": "jetbrains.charisma.persistent.Issue"
          }
        ],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "previous step",
          "sourceToTarget": "next step",
          "name": "Folllowed",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "previous step",
          "sourceToTarget": "next step",
          "name": "Folllowed",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": false,
          "targetToSource": "similar to",
          "sourceToTarget": "similar to",
          "name": "Similar",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [
          {
            "id": "25-1537220",
            "$type": "jetbrains.charisma.persistent.Issue"
          }
        ],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": false,
          "targetToSource": "Reused in",
          "sourceToTarget": "Reused in",
          "name": "Reuse",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "also fixes",
          "sourceToTarget": "fixed by",
          "name": "Cause",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "also fixes",
          "sourceToTarget": "fixed by",
          "name": "Cause",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "caused by",
          "sourceToTarget": "leads to",
          "name": "Leads to",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      },
      {
        "linkType": {
          "directed": true,
          "targetToSource": "caused by",
          "sourceToTarget": "leads to",
          "name": "Leads to",
          "$type": "jetbrains.charisma.persistent.link.IssueLinkType"
        },
        "issues": [],
        "$type": "jetbrains.charisma.persistent.link.IssueLink"
      }
    ],
    "wikifiedDescription": "<div class=\"wiki text prewrapped\">Message from the forum <a href=\"http://devnet.jetbrains.com/message/5485890#5485890\">http://devnet.jetbrains.com/message/5485890#5485890</a><br/>______________________<br/><br/>Most every morning I sit down, start up my computer and start up all the programs I will be working with that day. I usually proceed to read my email first. Unfortunately, Intellij, like so many products, thinks it is the most important program ever and it must have my attention. So it steals focus and puts itself right in my face. However, I tend to have between 2-4 projects open in different windows. So it does this not only once but for each project.<br/> <br/>IMO there is never a case for focus stealing. One could make a case for security software which may have a legitimate need to demand direct action. I also think such a case has never occurred in my life. I suppose any kind of alarm program could make the case. I still wouldn&#39;t agree, but I can see that some people would. However IntelliJ has no case whatsoever to steal focus. Focus should be on what I am focussed on. Just because I started the IDE does not mean I intend to work with it right now. Untill someone implements a telepathic focus algorithm programs should just start up in the background and let me continue with whatever I am doing.</div>\n",
    "fields": [
      {
        "projectCustomField": {
          "field": {
            "name": "Priority",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumProjectCustomField"
        },
        "value": {
          "name": "Critical",
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumBundleElement"
        },
        "$type": "jetbrains.charisma.customfields.complex.enumeration.SingleEnumIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Type",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumProjectCustomField"
        },
        "value": {
          "name": "Bug",
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumBundleElement"
        },
        "$type": "jetbrains.charisma.customfields.complex.enumeration.SingleEnumIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "State",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.state.StateProjectCustomField"
        },
        "value": {
          "name": "Open",
          "$type": "jetbrains.charisma.customfields.complex.state.StateBundleElement"
        },
        "$type": "jetbrains.charisma.customfields.complex.state.StateIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Assignee",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.user.UserProjectCustomField"
        },
        "value": {
          "name": "Denis Fokin",
          "$type": "jetbrains.charisma.persistence.user.User"
        },
        "$type": "jetbrains.charisma.customfields.complex.user.SingleUserIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Subsystem",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.ownedField.OwnedProjectCustomField"
        },
        "value": {
          "name": "User Interface. Focus",
          "$type": "jetbrains.charisma.customfields.complex.ownedField.OwnedBundleElement"
        },
        "$type": "jetbrains.charisma.customfields.complex.ownedField.SingleOwnedIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Fixed in builds",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.build.BuildProjectCustomField"
        },
        "value": [],
        "$type": "jetbrains.charisma.customfields.complex.build.MultiBuildIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Fix versions",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.version.VersionProjectCustomField"
        },
        "value": [],
        "$type": "jetbrains.charisma.customfields.complex.version.MultiVersionIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Affected versions",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.version.VersionProjectCustomField"
        },
        "value": [],
        "$type": "jetbrains.charisma.customfields.complex.version.MultiVersionIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Spent time",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.youtrack.timetracking.periodField.PeriodProjectCustomField"
        },
        "value": null,
        "$type": "jetbrains.youtrack.timetracking.periodField.PeriodIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Tester",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.user.UserProjectCustomField"
        },
        "value": {
          "name": "Tatiana Ovsiannikova",
          "$type": "jetbrains.charisma.persistence.user.User"
        },
        "$type": "jetbrains.charisma.customfields.complex.user.SingleUserIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Verified",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumProjectCustomField"
        },
        "value": {
          "name": "No",
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumBundleElement"
        },
        "$type": "jetbrains.charisma.customfields.complex.enumeration.SingleEnumIssueCustomField"
      },
      {
        "projectCustomField": {
          "field": {
            "name": "Triaged",
            "$type": "jetbrains.charisma.customfields.rest.CustomField"
          },
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumProjectCustomField"
        },
        "value": {
          "name": "Yes",
          "$type": "jetbrains.charisma.customfields.complex.enumeration.EnumBundleElement"
        },
        "$type": "jetbrains.charisma.customfields.complex.enumeration.SingleEnumIssueCustomField"
      }
    ],
    "id": "25-550457",
    "$type": "jetbrains.charisma.persistent.Issue"
  };


  return {
    loadIssues: loadIssues
  }
})();