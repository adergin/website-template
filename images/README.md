# images

Your pictures go in here, and the pages point at them by filename.

Until a file exists the page shows a plain grey block with the filename
printed in the middle of it. That is deliberate: nothing looks broken while
you are still collecting photographs, and you can see at a glance what is
missing and what it should be called.

The pages as shipped refer to example-1.jpg through example-4.jpg. Replace
them with your own and rename the src attributes to something meaningful, or
just save your files under those names to see the layout fill up quickly.

world.svg is the map on the About page. It is built from Natural Earth's
public domain outlines, so you can keep it, change it or delete it freely.

A few things worth doing to a photograph before it goes in:

  - Resize it. About 1000px on the long edge is plenty for this layout, and
    the difference between a 4MB phone photo and a 200KB one is the
    difference between a page that loads instantly and one that does not.
  - Save as JPEG for photographs, PNG for logos and anything with a
    transparent background.
  - Check it is the right way up. Phone photos carry their rotation in EXIF
    data, which some tools drop when resizing, and the picture then publishes
    sideways.