# Selectio

###### Selectio is an image editing tool I built in 2020, testing out a rival concept to Photoshop.

https://tobiasloader.github.io/Selectio/index.html

The new idea is that we build a map of ``Selection Areas`` – layer by layer – on top of the image. Selecting regions of pixels is a subtractive process, since Selectio ensures all ``Areas`` are mutually exclusive.

![Selectio](https://github.com/TobiasLoader/Selectioe/blob/master/Selectio.png)

So for example given a region of pixels ``P`` in ``Area 1``, those pixels cannot be exist in any other ``Area N``. ``Area 0`` is the base layer, with the set of selected pixels being the empty set (no selection). All other layers are built inductively on top of this. The benefit with the design is we can then target ``P`` directly with our editing tools and guarantee independence from edits on any other area.

We can use typical image editing tools on individual Areas, like filling in the colour. An extension would be to build a Union operation on Areas to merge them.

I implemented 6 tools in total:

  - Magic Wand
  - Circle Select
  - Circle Deselect
  - Colour Fill
  - Colour Stroke
  - Revert Area

If you want to try it out, a warning that it is quite tricky to get the hang of the new paradigm at first (and the UI isn't fully polished of course)!