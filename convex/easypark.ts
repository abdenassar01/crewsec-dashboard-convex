/* eslint-disable max-lines-per-function */
import { httpAction } from './_generated/server';

export const checkParking = httpAction(async (ctx, request) => {
  const { searchParams } = new URL(request.url);
  const licenseNumber = searchParams.get('licenseNumber');

  if (!licenseNumber) {
    return new Response(
      JSON.stringify({ error: 'License number is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const username = process.env.EASYPARK_USERNAME;
  const password = process.env.EASYPARK_PASSWORD;
  const easyparkUrl = process.env.EASYPARK_URL;

  if (!username || !password || !easyparkUrl) {
    return new Response(
      JSON.stringify({
        error: 'Easypark configuration missing',
        message: 'Server configuration error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const fullUrl = `${easyparkUrl}?licenseNumber=${encodeURIComponent(licenseNumber)}`;
    console.log('Making Easypark API call to:', fullUrl);

    const headers = new Headers();
    const authString = btoa(`${username}:${password}`);
    headers.set('Authorization', `Basic ${authString}`);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Easypark API error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          error: `Error from Easypark API: ${response.statusText}`,
          status: response.status,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        message: 'Easypark data retrieved successfully',
        data: data,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Unexpected error in Easypark API call:', error);

    return new Response(
      JSON.stringify({
        error: 'An unexpected internal error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
