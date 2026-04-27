const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { readStore, run } = require("../src/task-agent");

test("adds, lists, updates, and annotates a task", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "task-agent-"));
  const output = [];
  const io = {
    cwd: workspace,
    stdout: { write: (text) => output.push(text) },
    stderr: { write: (text) => output.push(text) }
  };

  run(["add", "Write", "MVP", "design", "--priority", "high", "--due", "2026-05-01"], io);
  run(["list"], io);
  run(["update", "task-001", "--status", "doing"], io);
  run(["note", "task-001", "Reviewed initial JSON shape."], io);
  run(["show", "task-001"], io);

  const store = readStore(path.join(workspace, ".task-agent", "tasks.json"));
  assert.equal(store.tasks.length, 1);
  assert.equal(store.tasks[0].id, "task-001");
  assert.equal(store.tasks[0].title, "Write MVP design");
  assert.equal(store.tasks[0].status, "doing");
  assert.equal(store.tasks[0].priority, "high");
  assert.equal(store.tasks[0].due_date, "2026-05-01");
  assert.equal(store.tasks[0].notes[0].text, "Reviewed initial JSON shape.");
  assert.match(output.join(""), /task-001 \[todo\] \(high\) Write MVP design/);
});

test("filters tasks by status", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "task-agent-"));
  const output = [];
  const io = {
    cwd: workspace,
    stdout: { write: (text) => output.push(text) },
    stderr: { write: (text) => output.push(text) }
  };

  run(["add", "First"], io);
  run(["add", "Second"], io);
  run(["update", "task-002", "--status", "done"], io);
  output.length = 0;

  run(["list", "--status", "done"], io);

  assert.match(output.join(""), /task-002/);
  assert.doesNotMatch(output.join(""), /task-001/);
});

test("rejects invalid status values", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "task-agent-"));
  const io = {
    cwd: workspace,
    stdout: { write: () => {} },
    stderr: { write: () => {} }
  };

  run(["add", "First"], io);

  assert.throws(
    () => run(["update", "task-001", "--status", "blocked"], io),
    /Invalid status/
  );
});
