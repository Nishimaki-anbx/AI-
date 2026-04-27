const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_DATA_FILE = path.join(".task-agent", "tasks.json");
const STATUSES = new Set(["todo", "doing", "done"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

function main(argv) {
  try {
    const result = run(argv, {
      cwd: process.cwd(),
      stdout: process.stdout,
      stderr: process.stderr
    });
    process.exitCode = result.exitCode;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

function run(argv, io) {
  const { dataFile, rest } = parseGlobalOptions(argv);
  const command = rest[0];
  const args = rest.slice(1);
  const storePath = path.resolve(io.cwd, dataFile);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    io.stdout.write(helpText());
    return { exitCode: 0 };
  }

  switch (command) {
    case "add":
      return addTask(storePath, args, io);
    case "list":
      return listTasks(storePath, args, io);
    case "show":
      return showTask(storePath, args, io);
    case "update":
      return updateTask(storePath, args, io);
    case "note":
      return addNote(storePath, args, io);
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

function parseGlobalOptions(argv) {
  const rest = [];
  let dataFile = DEFAULT_DATA_FILE;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--data-file") {
      dataFile = requireValue(argv, index, "--data-file");
      index += 1;
    } else {
      rest.push(value);
    }
  }

  return { dataFile, rest };
}

function addTask(storePath, args, io) {
  const { values, options } = parseOptions(args, {
    priority: true,
    due: true
  });
  const title = values.join(" ").trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  const priority = options.priority || "medium";
  validatePriority(priority);

  const store = readStore(storePath);
  const now = nowIso();
  const task = {
    id: nextTaskId(store.tasks),
    title,
    status: "todo",
    priority,
    due_date: options.due || null,
    notes: [],
    created_at: now,
    updated_at: now
  };

  store.tasks.push(task);
  writeStore(storePath, store);
  io.stdout.write(`Added ${task.id}: ${task.title}\n`);
  return { exitCode: 0 };
}

function listTasks(storePath, args, io) {
  const { values, options } = parseOptions(args, { status: true });
  if (values.length > 0) {
    throw new Error(`Unexpected arguments: ${values.join(" ")}`);
  }

  if (options.status) {
    validateStatus(options.status);
  }

  const store = readStore(storePath);
  const tasks = options.status
    ? store.tasks.filter((task) => task.status === options.status)
    : store.tasks;

  if (tasks.length === 0) {
    io.stdout.write("No tasks found.\n");
    return { exitCode: 0 };
  }

  for (const task of tasks) {
    io.stdout.write(formatTaskLine(task));
  }
  return { exitCode: 0 };
}

function showTask(storePath, args, io) {
  const id = singleRequiredArg(args, "Task id is required.");
  const task = findTask(readStore(storePath), id);
  io.stdout.write(formatTaskDetail(task));
  return { exitCode: 0 };
}

function updateTask(storePath, args, io) {
  const { values, options } = parseOptions(args, {
    title: true,
    status: true,
    priority: true,
    due: true,
    "clear-due": false
  });
  const id = singleRequiredArg(values, "Task id is required.");
  const store = readStore(storePath);
  const task = findTask(store, id);

  if (options.status) {
    validateStatus(options.status);
    task.status = options.status;
  }
  if (options.priority) {
    validatePriority(options.priority);
    task.priority = options.priority;
  }
  if (options.title) {
    task.title = options.title;
  }
  if (options.due) {
    task.due_date = options.due;
  }
  if (options["clear-due"]) {
    task.due_date = null;
  }

  task.updated_at = nowIso();
  writeStore(storePath, store);
  io.stdout.write(`Updated ${task.id}: ${task.title}\n`);
  return { exitCode: 0 };
}

function addNote(storePath, args, io) {
  const id = args[0];
  const text = args.slice(1).join(" ").trim();
  if (!id) {
    throw new Error("Task id is required.");
  }
  if (!text) {
    throw new Error("Note text is required.");
  }

  const store = readStore(storePath);
  const task = findTask(store, id);
  const now = nowIso();
  task.notes.push({ text, created_at: now });
  task.updated_at = now;
  writeStore(storePath, store);
  io.stdout.write(`Added note to ${task.id}.\n`);
  return { exitCode: 0 };
}

function readStore(storePath) {
  if (!fs.existsSync(storePath)) {
    return { tasks: [] };
  }

  const content = fs.readFileSync(storePath, "utf8");
  const data = JSON.parse(content);
  if (!Array.isArray(data.tasks)) {
    throw new Error("Invalid task data: tasks must be an array.");
  }
  return data;
}

function writeStore(storePath, store) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function parseOptions(args, schema) {
  const values = [];
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) {
      values.push(value);
      continue;
    }

    const name = value.slice(2);
    if (!(name in schema)) {
      throw new Error(`Unknown option: ${value}`);
    }
    if (schema[name]) {
      options[name] = requireValue(args, index, value);
      index += 1;
    } else {
      options[name] = true;
    }
  }

  return { values, options };
}

function requireValue(args, index, optionName) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${optionName} requires a value.`);
  }
  return value;
}

function singleRequiredArg(args, message) {
  if (args.length === 0) {
    throw new Error(message);
  }
  if (args.length > 1) {
    throw new Error(`Unexpected arguments: ${args.slice(1).join(" ")}`);
  }
  return args[0];
}

function findTask(store, id) {
  const task = store.tasks.find((candidate) => candidate.id === id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }
  return task;
}

function nextTaskId(tasks) {
  const nextNumber = tasks.reduce((max, task) => {
    const match = /^task-(\d+)$/.exec(task.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;

  return `task-${String(nextNumber).padStart(3, "0")}`;
}

function validateStatus(status) {
  if (!STATUSES.has(status)) {
    throw new Error(`Invalid status: ${status}. Use todo, doing, or done.`);
  }
}

function validatePriority(priority) {
  if (!PRIORITIES.has(priority)) {
    throw new Error(`Invalid priority: ${priority}. Use low, medium, or high.`);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function formatTaskLine(task) {
  const due = task.due_date ? ` due:${task.due_date}` : "";
  return `${task.id} [${task.status}] (${task.priority}) ${task.title}${due}\n`;
}

function formatTaskDetail(task) {
  const lines = [
    `${task.id}: ${task.title}`,
    `status: ${task.status}`,
    `priority: ${task.priority}`,
    `due_date: ${task.due_date || "-"}`,
    `created_at: ${task.created_at}`,
    `updated_at: ${task.updated_at}`,
    "notes:"
  ];

  if (task.notes.length === 0) {
    lines.push("- none");
  } else {
    for (const note of task.notes) {
      lines.push(`- ${note.created_at}: ${note.text}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function helpText() {
  return `Task Agent MVP

Usage:
  node bin/task-agent.js [--data-file path] <command>

Commands:
  add <title> [--priority low|medium|high] [--due YYYY-MM-DD]
  list [--status todo|doing|done]
  show <task-id>
  update <task-id> [--title text] [--status todo|doing|done] [--priority low|medium|high] [--due YYYY-MM-DD] [--clear-due]
  note <task-id> <text>

Default data file:
  ${DEFAULT_DATA_FILE}
`;
}

module.exports = {
  DEFAULT_DATA_FILE,
  addNote,
  addTask,
  listTasks,
  main,
  readStore,
  run,
  updateTask
};
