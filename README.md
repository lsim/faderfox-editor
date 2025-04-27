# Faderfox Controller Editor (Web-MIDI)
This project offers browser-based editors for MIDI controllers by [faderfox.de](http://faderfox.de).

To use this editor you need a Web-MIDI-enabled webbrowser. Currently only Google Chrome (since Version 49 with sysex-support) and [Chromium](https://www.chromium.org/Home) support Web-MIDI.

## EC4 Editor

Editor for the [EC4 Encoder Controller](http://www.faderfox.de/ec4.html). You can find a ready-to-use version under [https://www.privatepublic.de/faderfox-editor/ec4](https://www.privatepublic.de/faderfox-editor/ec4).

## PC4 editor

Editor for the [PC4 Pot Controller](http://faderfox.de/pc4.html). You can find a ready-to-use version under [https://www.privatepublic.de/faderfox-editor/pc4](https://www.privatepublic.de/faderfox-editor/pc4).


This software was developed in co-operation with faderfox.


## EC4 Editor reimplementation

A copycat reimplementation of the EC4 editor is available at [https://lsim.github.io/faderfox-editor/](https://lsim.github.io/faderfox-editor/).

Imitation is the highest form of flattery, after all 😉

I wanted to contribute new features but was not up to the task of properly working with the original implementation.

Extra features have been added compared to the (already awesome) original editor.

- Storage of configuration data in the browser's IndexedDb
- Auto saving of data to the db (page reload no longer a thing to be feared!)
- Undo/Redo
- Easy sharing of setups between users. Show off your awesome configurations!
- Multiple named configuration 'bundles' can be switched between, saved to a .syx file or sent to the EC4
- Sysex dumps from the EC4 are shown as new bundles
- Progressive Web App support, so you can install the editor on your desktop/ipad and use it offline
- Keyboard shortcuts for navigation
- Easy copy/paste of individual encoders in addition to groups/setups (as in the original). Tip: copying between bundles also works.
- Setup/group synchronization between the editor and the EC4. Use that muscle memory!
- Encoder selection possible via EC4 push buttons
- Numeric values can be set with EC4 encoders
- Pause-screen-animation when left idle 😀

#### Drawbacks of the reimplementation
Lack of battle hardening means you may encounter bugs. I haven't had time to test the editor extensively, so please report any issues you find.

Unlike the original editor (which astonishingly is dependency free) this one has a huge dependency tree. This makes it more prone to 'npm rot' and so it may not fare as well over time as the original. The hope is that the trade-off will be that new features can be added faster.
