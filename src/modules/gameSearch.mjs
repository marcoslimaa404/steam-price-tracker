import fetch from 'node-fetch';

export async function searchGamesByName(name) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(name)}&l=english&cc=us`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.items || data.items.length === 0) return [];

  return data.items.slice(0, 5).map(game => ({
    id: game.id,
    name: game.name,
    image: game.tiny_image,
    price: game.price ? game.price.final / 100 : 'Free'
  }));
}
