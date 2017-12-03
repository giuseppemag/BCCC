import { Sum, Fun } from './ccc';
export declare let map_plus_left: <a, b, c>() => Fun<Fun<a, c>, Fun<Sum<a, b>, Sum<c, b>>>;
export declare let map_plus_right: <a, b, c>() => Fun<Fun<b, c>, Fun<Sum<a, b>, Sum<a, c>>>;
