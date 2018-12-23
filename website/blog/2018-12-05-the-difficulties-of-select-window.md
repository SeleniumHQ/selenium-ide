---
author: Tomer Steinfeld
authorURL: https://twitter.com/corevous
authorImageURL: https://www.gravatar.com/avatar/5291d34ae8774a78fc61c6bd430f8425
title: The Difficulties of Selecting Windows
canonical: https://corevo.io/the-difficulties-of-select-window/
---

When recording a test case, more often than not, window management becomes an issue,
the test case may open a popup, or follow a `target=_blank` link.
Nonetheless, Selenium IDE is expected to follow, and record, recording the window and tab
switching in such a way, that there is no need for manual fixing post-recording.

But here lies the issue **selecting windows is stateful**.

<!--truncate-->

## The evolution of Select Window

Select window was initially introduced in the legacy IDE (a.k.a selectWindow),
It too knew back then, that windows can't be followed based on any of their
defining properties: title, url, etc...  
Instead, it generated a temporary ID for each window, requiring the user to
manually intervene and give each one a permanent ID, this was enabled by the fact
that the IDE overrode `_blank` targets, and instead redirected the call to
[`window.open`](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).  

Later on SideeX came along, their solution was more intuitive, but short sighted.
Their idea was to tap into [`browser.webNavigation.onCreatedNavigationTarget`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCreatedNavigationTarget),
this event lets the IDE know when a new tab or window is opened, and it's creation cause.
This easily lead to mapping the tree of open tabs, giving them all IDs based on their
order of appearance.  
This way, the user naturally can select whichever window they want, without much
thought on what's being done behind the scenes.  

Both solutions have shortcomings. The legacy solution required the user to know
the state of the opened tabs at all times, and to give the same ID each time the
same window was to be called.  
SideeX on the other hand, did not think about future additions to the IDE, now
having control flow commands, windows may never be opened, even if they were
during recording, or worse, windows could be opened in a loop which further
complicates the tracking mechanism.

## The middleman solution

By this point we know two things:

 - We can't let the user manually figure out the window layout.
 - We can't rely on the windows to identify them, by properties nor index.

Instead we'll use a **middleman solution**, I call it that because it is
a solution that both requires the user to name their windows, and it follows
the windows consistently and immediately post-recording.  
When we realize that a window was opened, instead of generating an ID based
on it's order of appearance, its handle will be saved to a variable that the
user will name.  
![Select Window](/selenium-ide/img/blog/1-select-window.png "Click specifies it's opened window handle name")
From this point, we can reliably refer to the window by an ID rather than index.
![Test Steps](/selenium-ide/img/blog/1-commands.png "Using the named handle to switch to the window")

The `click` commands can now specify it opens a new window, the user can then
give the window a name, and set the timeout to wait for that window to appear.  
While recording the IDE will assume to wait 2 seconds, and will generate a name
for the window.

## Release plan

Opening IDE projects with newer versions of the IDE will automatically migrate
the test scripts to use the new `select window` command.  
The migration will try to recognize when a new window is opened and will set
that command as *opens window*, will generate a handle name and set the timeout
to 2 seconds.  
In some cases where the IDE will fail to recognize which commands initiates the
opening of the window, the test case will fail, and the user will have to amend
the migration.  
Moreover the IDE will save the initial window's handle using the new `store current
window handle` command in test cases where the user switches back and forth to
and from the initial window.

The current plan is to land the change as part of the 3.5 release, in preparation
for playback using WebDriver.

Special thanks to [@tourdedave](https://twitter.com/tourdedave) for editing.
