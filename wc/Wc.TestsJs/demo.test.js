import test from 'ava';

//import { demo } from './src/demo-module';
import { demo } from '../wc/components/dist-ts/mash-grid/demo-module';

import { mashgrid} from '../wc/components/dist-ts/mash-grid/mash-grid';


test('can add numbers', t => {
    t.is(1 + 1, 2);
});




test('can import from demo module', t => {
    const expected = 'a';

    const result = demo();

    console.log(typeof demo);
    t.is(result, expected);

    t.is(1,1)

});
