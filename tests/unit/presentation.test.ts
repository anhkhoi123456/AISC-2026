import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../../src/services/demo-data";
import { presentListing } from "../../src/features/listings/lib/presentation";

test("legacy sample presentation uses known fields without rewriting saved or custom listings", () => {
  const room = {
    ...createInitialState().listings[0],
    title: "Một góc bình yên, đầy ánh sáng",
    image: "/images/room-4.jpg",
    size: 19,
    amenities: ["WC riêng"],
  };
  const before = structuredClone(room);
  const shown = presentListing(room);
  assert.match(shown.title, /19 m² · WC riêng/);
  assert.doesNotMatch(shown.title, /ban công|ánh sáng/);
  assert.equal(shown.image, "/images/student-room.jpg");
  assert.deepEqual(room, before);
  const custom = { ...room, id: "my-listing", title: "Phòng của mình" };
  assert.equal(presentListing(custom).title, custom.title);
  const real = { ...room, demo: false };
  assert.equal(presentListing(real), real);
});
