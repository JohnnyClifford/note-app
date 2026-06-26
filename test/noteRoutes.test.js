const assert = require('node:assert/strict');

const noteController = require('../controllers/noteController');
const noteRoutes = require('../routes/noteRoutes');

function findRoute(method, path) {
  return noteRoutes.stack.find((layer) => {
    return layer.route?.path === path && layer.route.methods[method];
  });
}

describe('note routes', () => {
  it('registers the expected REST endpoints', () => {
    const routes = noteRoutes.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    assert.deepEqual(routes, [
      { path: '/', methods: ['get'] },
      { path: '/tags', methods: ['get'] },
      { path: '/', methods: ['post'] },
      { path: '/:id', methods: ['put'] },
      { path: '/:id', methods: ['delete'] },
    ]);
  });

  it('connects routes to the note controller handlers', () => {
    assert.equal(findRoute('get', '/').route.stack[0].handle, noteController.getAllNotes);
    assert.equal(findRoute('get', '/tags').route.stack[0].handle, noteController.getAllTags);
    assert.equal(findRoute('post', '/').route.stack[0].handle, noteController.createNote);
    assert.equal(findRoute('put', '/:id').route.stack[0].handle, noteController.updateNote);
    assert.equal(findRoute('delete', '/:id').route.stack[0].handle, noteController.deleteNote);
  });
});
