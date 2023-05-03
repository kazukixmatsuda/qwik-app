import { component$, useSignal, useStylesScoped$, useTask$ } from '@builder.io/qwik';
import { Form, routeAction$, routeLoader$, server$ } from '@builder.io/qwik-city';
import STYLES from './index.css?inline';

type Joke = {
  id: string;
  status: number;
  joke: string;
};

// server -> client
export const useDadJoke = routeLoader$(async () => {
  const res = await fetch('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' }
  });

  const json = (await res.json()) as Joke;
  return json;
});

// client -> server
export const useJokeVoteAction = routeAction$((props) => {
  console.log('VOTE', props);
});

export default component$(() => {
  useStylesScoped$(STYLES);

  const isFavoriteSignal = useSignal(false); // state

  const dadJokeSignal = useDadJoke();
  const favoriteVoteAction = useJokeVoteAction();

  // effect
  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
    server$(() => {
      console.log('FAVORITE (server)', isFavoriteSignal.value);
    })();
  });

  return (
    <section class="section bright">
      <p>{dadJokeSignal.value.joke}</p>
      <Form action={favoriteVoteAction}>
        <input type="hidden" name="jokeID" value={dadJokeSignal.value.id} />
        <button name="vote" value="up">
          👍
        </button>
        <button name="vote" value="down">
          👎
        </button>
      </Form>
      <button onClick$={() => (isFavoriteSignal.value = !isFavoriteSignal.value)}>
        {isFavoriteSignal.value ? '❤️' : '🤍'}
      </button>
    </section>
  );
});
