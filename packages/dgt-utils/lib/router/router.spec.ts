import { matchPath, activeRoute, Route, urlVariables, updateHistory, updateTitle, routerStateConfig, ROUTER, RouterStates, NavigateEvent, NavigatedEvent, routerEventsConfig, RouterEvents, createRoute } from './router';

describe('Router', () => {

  delete window.location;
  (window.location as any) = new URL('http://localhost/test/12345/testing');

  const path = '/test-path';
  const differentPath = '/other-test-path';
  const title = 'Title | Test';

  describe('matchPath', () => {

    it('should error when path is falsey', () => {

      expect(() => matchPath(undefined)).toThrow('Argument path should be set.');
      expect(() => matchPath(null)).toThrow('Argument path should be set.');

    });

    it('should return true when path matches window.location', () => {

      expect(matchPath('/test/12345/testing')).toBeTruthy();
      expect(matchPath('/test/{{numbers}}/testing')).toBeTruthy();
      expect(matchPath('/{{partOne}}/{{numbers}}/{{partTwo}}')).toBeTruthy();
      expect(matchPath('/{{partOne}}/.*')).toBeTruthy();

    });

    it('should return false when path does not match window.location', () => {

      expect(matchPath('/test')).toBeFalsy();
      expect(matchPath('/test/testing')).toBeFalsy();
      expect(matchPath('/test/12345//testing')).toBeFalsy();
      expect(matchPath('')).toBeFalsy();

    });

  });

  describe('activeRoute', () => {

    it('should error when routes is undefined or empty', () => {

      expect(() => activeRoute(undefined)).toThrow('Argument routes should be set.');
      expect(() => activeRoute(null)).toThrow('Argument routes should be set.');
      expect(() => activeRoute([])).toThrow('Argument routes should be set.');

    });

    it('should return first matching path', () => {

      const routes: Route[] = [
        { path: '/test/12345/testing', targets: [] },
        { path: '/test/{{numbers}}/testing', targets: [] },
      ];

      expect(activeRoute(routes)).toEqual(expect.objectContaining(routes[0]));

    });

    it('should error when no match is found', () => {

      const routes: Route[] = [
        { path: '/test/testing', targets: [] },
        { path: '/test', targets: [] },
      ];

      expect(() => activeRoute(routes)).toThrow('No route match found for this URL');

    });

  });

  describe('urlVariables', () => {

    const route: Route = {
      path: '/{{partOne}}/{{numbers}}/{{partTwo}}',
      targets: [],
    };

    beforeEach(() => {

      delete window.location;
      (window.location as any) = new URL('http://localhost/test/12345/testing?search=test#test');

    });

    it('should return a correct map of path params', () => {

      // window.location.pathname = '/test/12345/testing'
      const result = urlVariables(route);

      expect(result.pathParams.get('partOne')).toBe('test');
      expect(result.pathParams.get('numbers')).toBe('12345');
      expect(result.pathParams.get('partTwo')).toBe('testing');

    });

    it('should return correct searchParams', () => {

      const result = urlVariables(route);

      expect(result.searchParams.get('search')).toBe('test');

    });

    it('should return correct hash', () => {

      const result = urlVariables(route);

      expect(result.hash).toBe('#test');

    });

    it('should return empty map when no path variable exists', () => {

      const routeWithoutParams: Route = {
        path: '/path/without/variables',
        targets: [],
      };

      expect(urlVariables(routeWithoutParams).pathParams.size).toBe(0);

    });

    it('should not match greedy on /.* routes', async () => {

      delete window.location;
      (window.location as any) = new URL('http://localhost/onePart/12345/filler/testing?search=test#test');

      const testRoute: Route = {
        path: '/{{partOne}}/{{numbers}}/.*',
        targets: [],
      };

      expect(urlVariables(testRoute).pathParams.get('numbers')).toBe('12345');

    });

    it('should error when no match was found for every variable', () => {

      const invalidRoute: Route = {
        path: '/{{partOne}}//{{numbers}}/{{partTwo}}',
        targets: [],
      };

      // usually happens when an invalid path was provided (here: double slashes)
      // or when the regex is made incorrect matches (should not happen)
      expect(() => urlVariables(invalidRoute)).toThrow('No match for every variable');

    });

  });

  describe('updateHistory', () => {

    beforeEach(() => {

      delete window.location;
      (window.location as any) = new URL(`http://localhost${path}`);
      history.replaceState = jest.fn();
      history.pushState = jest.fn();

    });

    it('should call replaceState when path matches current URL', () => {

      const spy = jest.spyOn(history, 'replaceState');
      updateHistory(path, title);

      expect(spy).toHaveBeenCalledWith({}, title, path);

    });

    it('should call replaceState with empty title when title is not set', () => {

      const spy = jest.spyOn(history, 'replaceState');
      updateHistory(path, '');

      expect(spy).toHaveBeenCalledWith({}, '', path);

    });

    it('should call pushState when path is different from current URL', () => {

      const spy = jest.spyOn(history, 'pushState');
      updateHistory(differentPath, title);

      expect(spy).toHaveBeenCalledWith({}, title, differentPath);

    });

    it('should call pushState with empty title when title is not set', () => {

      const spy = jest.spyOn(history, 'pushState');
      updateHistory(differentPath, '');

      expect(spy).toHaveBeenCalledWith({}, '', differentPath);

    });

    it('should persist query parameters and hashes', () => {

      const spy = jest.spyOn(history, 'pushState');
      const queryPath = `${differentPath}?lang=en`;
      updateHistory(queryPath, '');

      expect(spy).toHaveBeenCalledWith({}, '', queryPath);

      const hashPath = `${differentPath}#me`;
      updateHistory(hashPath, '');

      expect(spy).toHaveBeenCalledWith({}, '', hashPath);

    });

  });

  describe('updateTitle', () => {

    it('should set document.title', () => {

      document.title = '';

      expect(document.title).toBe('');

      updateTitle(title);

      expect(document.title).toEqual(title);

    });

  });

  describe('routerStateConfig', () => {

    const routes: Route[] = [
      {
        path,
        targets: [ 'target' ],
        title: 'test title',
      },
    ];

    it('invoke.src should always resolve', async () => {

      const config = routerStateConfig(routes);
      const result = config[ROUTER].states[RouterStates.NAVIGATING].invoke.src();

      await expect(result).resolves.toBeUndefined();

    });

    it('invoke.onDone should contain correct target and actions', () => {

      delete window.location;
      (window.location as any) = new URL(`http://localhost${path}`);
      const config = routerStateConfig(routes);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.target)
        .toContain(activeRoute(routes).targets[0]);

    });

    it('invoke.onDone.target should always contain RouterStates.IDLE', () => {

      delete window.location;
      (window.location as any) = new URL(`http://localhost${path}`);
      const config = routerStateConfig(routes);

      expect(config[ROUTER].states[RouterStates.NAVIGATING].invoke.onDone.target)
        .toContain(RouterStates.IDLE);

    });

  });

  describe('NavigateEvent', () => {

    it('should create', () => {

      const event = new NavigateEvent(path);

      expect(event).toBeTruthy();
      expect(event.path).toEqual(path);

    });

  });

  describe('NavigatedEvent', () => {

    it('should create', () => {

      const event = new NavigatedEvent(path, title);

      expect(event).toBeTruthy();
      expect(event.path).toEqual(path);
      expect(event.title).toEqual(title);

    });

  });

  describe('routerEventsConfig', () => {

    it('should return NAVIGATE event config', () => {

      const result = routerEventsConfig();

      expect(result).toEqual(expect.objectContaining({ [RouterEvents.NAVIGATE]: expect.objectContaining({}) }));
      expect(result[RouterEvents.NAVIGATE].target).toContain(`#${RouterStates.NAVIGATING}`);
      expect((result[RouterEvents.NAVIGATE].actions[0].assignment as any).path(undefined, new NavigateEvent('path'))).toBe('path');

      expect((result[RouterEvents.NAVIGATE].actions[0].assignment as any).path(undefined, new NavigateEvent()))
        .toEqual(window.location.pathname);

    });

    it('should return NAVIGATED event config', () => {

      const result = routerEventsConfig();

      expect(result).toEqual(expect.objectContaining({ [RouterEvents.NAVIGATED]: expect.objectContaining({}) }));
      expect(result[RouterEvents.NAVIGATED].actions[0](undefined, new NavigatedEvent('test', 'test'))).toBeUndefined();

    });

  });

  describe('createRoute', () => {

    it('should return correct route object', () => {

      expect(createRoute('path', [])).toEqual({ path: 'path', targets: [], title: undefined });
      expect(createRoute('path', [], 'title')).toEqual({ path: 'path', targets: [], title: 'title' });

    });

  });

});
