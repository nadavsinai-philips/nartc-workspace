import {
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  Optional,
} from '@angular/core';
import { derive } from './derive';
import { state } from './state';
import { DeriveFns, StateProxy } from './types';
import { destroy, getSnapshot, noop } from './utils';

export const INITIAL_STATE = new InjectionToken('__initial_state_token__', {
  providedIn: 'root',
  factory() {
    return {};
  },
});

export const ON_DESTROY = new InjectionToken('__on_destroy_token__', {
  providedIn: 'root',
  factory() {
    return noop;
  },
});

@Injectable()
export class State<TData extends object> implements OnDestroy {
  readonly state: StateProxy<TData>;

  private deriveProxies: Array<StateProxy> = [];

  constructor(
    @Optional() @Inject(INITIAL_STATE) initialState: TData,
    @Optional() @Inject(ON_DESTROY) protected onDestroy?: VoidFunction
  ) {
    this.state = state<TData>(initialState);
  }

  get snapshot(): TData {
    return getSnapshot(this.state);
  }

  protected createDerive<TDerived extends object>(
    deriveFns: DeriveFns<TDerived>,
    debounced = true
  ): StateProxy<TDerived> {
    const deriveProxy = derive(deriveFns, debounced);
    this.deriveProxies.push(deriveProxy);
    return deriveProxy;
  }

  ngOnDestroy() {
    if (this.onDestroy) {
      this.onDestroy();
    }
    destroy(this.state);
    this.deriveProxies.forEach(destroy);
  }
}
