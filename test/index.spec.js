/* global jest, expect, describe, it */
import contextProxy from '../src/index';
import { expectAllEntries, expectLastCallParameter } from './helpers';

const mockContextTraps = () => ({
    getPrototypeOf: jest.fn().mockImplementation((target,) => Object.getPrototypeOf(target)),
    setPrototypeOf: jest.fn().mockReturnValue(true),
    isExtensible: jest.fn().mockReturnValue(true),
    preventExtensions: jest.fn().mockReturnValue(false),
    getOwnPropertyDescriptor: jest.fn().mockImplementation((target, prop) => Object.getOwnPropertyDescriptor(target, prop)),
    has: jest.fn().mockReturnValue(true),
    get: jest.fn().mockReturnValue(true),
    set: jest.fn().mockReturnValue(true),
    deleteProperty: jest.fn().mockReturnValue(true),
    defineProperty: jest.fn().mockReturnValue(true),
    enumerate: jest.fn().mockReturnValue(['a'][Symbol.iterator]()),
    ownKeys: jest.fn().mockReturnValue(['a', 'prototype']),
    apply: jest.fn().mockReturnValue(true),
    construct: jest.fn().mockReturnValue({})
});

const proxyTest = function(test) {
    const context = { context: true };
    const target = function() {};

    const traps = mockContextTraps();

    const proxy = new contextProxy(target, traps, context);

    expect(proxy).toBeTruthy();

    return test.bind(this, proxy, target, traps, context);
};

describe('Context Proxy', () => {
    it('returns proxy', () => {
        expect(contextProxy({} , {}, {})).toBeTruthy();
    });

    it('instantiates', () => {
        expect(new contextProxy({} , {}, {})).toBeTruthy();
    });

    it('traps getOwnPropertyDescriptor', proxyTest((proxy, target, traps, context) => {
        expect(Object.getOwnPropertyDescriptor(proxy, 'prototype')).toBeTruthy();
        expect(traps.getOwnPropertyDescriptor).lastCalledWith(target, 'prototype');
        expectAllEntries(traps.getOwnPropertyDescriptor.mock.instances, context);
    }));

    it('traps has', proxyTest((proxy, target, traps, context) => {
        expect('a' in proxy).toBeTruthy();
        expect(traps.has).lastCalledWith(target, 'a');
        expectAllEntries(traps.has.mock.instances, context);
    }));

    it('traps get', proxyTest((proxy, target, traps, context) => {
        expect(proxy.a).toBeTruthy();
        expectLastCallParameter(traps.get, 0).toBe(target);
        expectLastCallParameter(traps.get, 1).toEqual('a');
        expectAllEntries(traps.get.mock.instances, context);
    }));

    it('traps set', proxyTest((proxy, target, traps, context) => {
        proxy.a = 5;
        expectLastCallParameter(traps.set, 0).toBe(target);
        expectLastCallParameter(traps.set, 1).toEqual('a');
        expectLastCallParameter(traps.set, 2).toEqual(5);
        expectAllEntries(traps.set.mock.instances, context);
    }));

    it('traps delete', proxyTest((proxy, target, traps, context) => {
        delete proxy.a;
        expectLastCallParameter(traps.deleteProperty, 0).toBe(target);
        expectLastCallParameter(traps.deleteProperty, 1).toEqual('a');
        expectAllEntries(traps.deleteProperty.mock.instances, context);
    }));

    it('traps define', proxyTest((proxy, target, traps, context) => {
        const desc = { configurable: true, enumerable: true, value: 10 };
        Object.defineProperty(proxy, 'c', desc);
        expectLastCallParameter(traps.defineProperty, 0).toBe(target);
        expectLastCallParameter(traps.defineProperty, 1).toEqual('c');
        expectLastCallParameter(traps.defineProperty, 2).toEqual(desc);
        expectAllEntries(traps.defineProperty.mock.instances, context);
    }));

    it('traps ownKeys', proxyTest((proxy, target, traps, context) => {
        expect(Object.getOwnPropertyNames(proxy)).toBeTruthy();
        expect(traps.ownKeys).lastCalledWith(target);
        expectAllEntries(traps.ownKeys.mock.instances, context);
    }));

    it('traps enumerate', proxyTest((proxy, target, traps, context) => {
        for (const x in proxy) {
            expect(x).toBeTruthy();
        }

        if (traps.enumerate.mock.calls.length > 0) {
            expect(traps.enumerate).lastCalledWith(target);
            expectAllEntries(traps.enumerate.mock.instances, context);
        } else {
            expect(traps.ownKeys).lastCalledWith(target);
            expectAllEntries(traps.ownKeys.mock.instances, context);
        }

        // getPrototypeOf(target: T): object | null;
    }));

    it('traps apply', proxyTest((proxy, target, traps, context) => {
        expect(proxy(1, 2, 3, 4, 5)).toBeTruthy();
        expect(traps.apply).lastCalledWith(target, undefined, [1, 2, 3, 4, 5]);
        expectAllEntries(traps.apply.mock.instances, context);
    }));

    it('traps construct', proxyTest((proxy, target, traps, context) => {
        expect(new proxy(1, 2, 3, 4, 5)).toBeTruthy();
        expectLastCallParameter(traps.construct, 0).toBe(target);
        expectLastCallParameter(traps.construct, 1).toEqual([1, 2, 3, 4, 5]);
        expectAllEntries(traps.construct.mock.instances, context);
    }));

    it('traps getPrototypeOf', proxyTest((proxy, target, traps, context) => {
        expect(Object.getPrototypeOf(proxy)).toBe(Object.getPrototypeOf(target));
        expect(traps.getPrototypeOf).lastCalledWith(target);
        expectAllEntries(traps.getPrototypeOf.mock.instances, context);
    }));

    it('traps setPrototypeOf', proxyTest((proxy, target, traps, context) => {
        const newProto = {};

        Object.setPrototypeOf(proxy, newProto);
        expect(traps.setPrototypeOf).lastCalledWith(target, newProto);
        expectAllEntries(traps.setPrototypeOf.mock.instances, context);
    }));

    it('traps isExtensible', proxyTest((proxy, target, traps, context) => {
        expect(Object.isExtensible(proxy)).toBeTruthy();
        expect(traps.isExtensible).lastCalledWith(target);
        expectAllEntries(traps.isExtensible.mock.instances, context);
    }));

    it('traps preventExtensions', proxyTest((proxy, target, traps, context) => {
        try {
            Object.preventExtensions(proxy);
        } catch (e) {}

        expect(traps.preventExtensions).lastCalledWith(target);
        expectAllEntries(traps.preventExtensions.mock.instances, context);
    }));
});
