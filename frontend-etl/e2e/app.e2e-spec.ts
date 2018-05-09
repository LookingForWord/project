import { FrontendEtlPage } from './app.po';

describe('frontend-etl App', () => {
  let page: FrontendEtlPage;

  beforeEach(() => {
    page = new FrontendEtlPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
