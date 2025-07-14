import { html, render } from 'lit-html';
import { createActor } from 'declarations/index.js';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';
import logo from './logo2.svg';

class App {
  greeting = '';

  constructor() {
    this.#render();
  }

  #handleSubmit = async e => {
    e.preventDefault();
    const name = document.getElementById('name').value;

    // We infer canister id at runtime in browser
    const canisterId = inferCanisterIdFromLocation();
    const my_hello_world_backend = createActor(canisterId, {});

    this.greeting = await my_hello_world_backend.greet(name);
    this.#render();
  };

  #render() {
    const body = html`
      <main>
        <img src="${logo}" alt="DFINITY logo" />
        <br />
        <br />
        <form action="#">
          <label for="name">Enter your name: &nbsp;</label>
          <input id="name" alt="Name" type="text" />
          <button type="submit">Click Me!</button>
        </form>
        <section id="greeting">${this.greeting}</section>
      </main>
    `;
    render(body, document.getElementById('root'));
    document
      .querySelector('form')
      .addEventListener('submit', this.#handleSubmit);
  }
}

export default App;
