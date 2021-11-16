/* eslint-disable @typescript-eslint/ban-types */

export type ClassType<T = any> = new (...args: any[]) => T;

const defaultContainer: { get<T>(someClass: { new (...args: any[]): T } | Function): T } = new (class {
  private instances: { type: Function; object: any }[] = [];
  get<T>(someClass: { new (...args: any[]): T }): T {
    let instance = this.instances.find((instance) => instance.type === someClass);
    if (!instance) {
      instance = { type: someClass, object: new someClass() };
      this.instances.push(instance);
    }

    return instance.object;
  }
})();

let userContainer: { get<T>(someClass: { new (...args: any[]): T } | Function): T };

export function useContainer(iocContainer: { get(someClass: any): any }): void {
  userContainer = iocContainer;
}

export function getFromContainer<T>(someClass: { new (...args: any[]): T } | Function): T {
  if (userContainer) {
    return userContainer.get(someClass);
  }
  return defaultContainer.get<T>(someClass);
}
