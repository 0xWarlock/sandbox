const { TestScheduler } = require('rxjs/testing');
const { interval, map, Subject, takeUntil, throttleTime, timer } = require('rxjs');

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

function turns(commands) {
  //const stop = new Subject();
  const stop = timer(99);
  return commands.pipe(takeUntil(stop), map(i => `turn ${i + 1}`));
}

test('takes all commands', (done) => {

  const commands = interval(20);
  const ts = turns(commands);
  const recordedTurns = [];

  ts.subscribe(turn => {
    if (recordedTurns.length == 4) {
      done('Too many turns');
    }

    recordedTurns.push(turn);
    
    if (recordedTurns.length == 4) {
      expect(recordedTurns).toEqual(['turn 1', 'turn 2', 'turn 3', 'turn 4']);
      done();
    }
  });
});

// test('takes all commands', () => {
//   testScheduler.run((helpers) => {
//     const { cold, expectObservable } = helpers;
//     const commands = cold('10ms a 9ms b 9ms c 9ms d|');
//     const expected =      '10ms a 9ms b 9ms c 9ms d|';
//     const values = {
//       a: 1,
//       b: 2,
//       c: 3,
//       d: 4, 
//     }

//     const turnsObservable = turns(commands).pipe(take(4));

//     expectObservable(turnsObservable).toBe(expected, values);
//   });
// });