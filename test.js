const { TestScheduler } = require('rxjs/testing');
const {
  distinctUntilChanged,
  distinct, first,
  from,
  interval,
  map,
  merge,
  mergeMap,
  single,
  Subject,
  takeUntil,
  throttle,
  throttleTime,
  toArray,
  timer,
  groupBy,
  Observable
} = require('rxjs');

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).toEqual(expected);
});

// This test runs synchronously.
test('generates the stream correctly', () => {
  testScheduler.run((helpers) => {
    const { cold, time, expectObservable, expectSubscriptions } = helpers;
    const e1 = cold(' -a--b--c---|');
    const e1subs = '  ^----------!';
    const t = time('   ---|       '); // t = 3
    const expected = '-a-----c---|';

    expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

function turns({ commands, ticksPerTurn }) {
    const observables = commands
    .pipe(
      groupBy(c => c.userId),
      mergeMap(user => user.pipe(
        distinctUntilChanged((prev, curr) => {
          return curr.tick - prev.tick < ticksPerTurn;
        })
      )),
    );
    return observables;
}

function generateCommands(commands) {
  return from(commands);
}

test('throttles characters', done => {
  const commands = generateCommands([
    {
      tick: 0,
      userId: 'u0',
      commandId: 'c0',
    },
    { 
      tick: 1,
      userId: 'u0',
      commandId: 'c1',
    },
    {
      tick: 2,
      userId: 'u1',
      commandId: 'c2'
    },
    {
      tick: 3,
      userId: 'u0',
      commandId: 'c3',
    },
    { 
      tick: 4,
      userId: 'u0',
      commandId: 'c4',
    },
    {
      tick: 5,
      userId: 'u1',
      commandId: 'c5',
    },
    {
      tick: 6,
      userId: 'u0',
      commandId: 'c6',
    },
    {
      tick: 7,
      userId: 'u1',
      commandId: 'c7',
    },
    {
      tick: 11,
      userId: 'u1',
      commandId: 'c8',
    },
  ]);
  
  const ts = turns({
    commands,
    ticksPerTurn: 4,
  });

  const recordedTurns = [];

  ts.subscribe(turn => {
    if (recordedTurns.length == 5) {
      done('Too many turns');
    }

    recordedTurns.push(turn);
    
    if (recordedTurns.length == 5) {
      try { 
        expect(recordedTurns).toEqual([
          {
            tick: 0,
            userId: 'u0',
            commandId: 'c0',
          },
          {
            tick: 2,
            userId: 'u1',
            commandId: 'c2',
          },
          {
            tick: 4,
            userId: 'u0',
            commandId: 'c4',
          },
          {
            tick: 7,
            userId: 'u1',
            commandId: 'c7',
          },
          {
            tick: 11,
            userId: 'u1',
            commandId: 'c8',
          },
        ]);
      } finally {
        done();
      }
    }
  });
});
