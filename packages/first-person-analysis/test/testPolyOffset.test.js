import PolyOffset from "../src/geometry/PolyOffset";

jest.mock('../src/geometry/PolyOffset');
const polyData = {
    "type": "curves",
    "curves": [{
        "type": "line",
        "vertices": [[58.89097395486307, -54.11762858604184, 72.01], [58.89097395486307, -54.11762858604184, 72.01]]
    }, {
        "type": "line",
        "vertices": [[58.89097395486307, -54.11762858604184, 72.01], [109.50347395486307, -54.11762858604184, 72.01]]
    }, {
        "type": "line",
        "vertices": [[109.50347395486307, -54.11762858604184, 72.01], [109.50347395486307, 50.41362141395817, 72.01]]
    }, {
        "type": "line",
        "vertices": [[109.50347395486307, 50.41362141395817, 72.01], [58.89097395486307, 50.41362141395817, 72.01]]
    }, {
        "type": "line",
        "vertices": [[58.89097395486307, 50.41362141395817, 72.01], [58.89097395486307, -54.11762858604184, 72.01]]
    }]
};

it('Test offset points', () => {
    const polyOffset = new PolyOffset(polyData);
    const points = polyOffset.calculateOffsetPoints(5, 10);
    expect(SoundPlayer).toHaveBeenCalledTimes(1);
});



