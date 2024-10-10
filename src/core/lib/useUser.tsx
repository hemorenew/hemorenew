import axios from 'axios';
import Router from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';

async function fetcher(url: string) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw new Error('Error al cargar el usuario');
  }
}

export default function useUser({
  redirectTo = '/',
  redirectIfFound = false,
} = {}) {
  const { data: user, mutate: mutateUser } = useSWR(
    `${process.env.NEXT_PUBLIC_URL}/api/auth/user`,
    fetcher
  );

  useEffect(() => {
    if (!redirectTo || !user) return;

    if (
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);
  return { user, mutateUser };
}
