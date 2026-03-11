export default async function handler(req, res) {
  const { id } = req.query;
  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!id) return res.status(400).json({ error: 'Folder ID required' });
  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents+and+trashed=false&fields=files(id,name)&orderBy=name&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const images = (data.files || [])
      .filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f.name))
      .map(f => ({
        id: f.id,
        name: f.name,
        url: `https://drive.google.com/uc?export=view&id=${f.id}`
      }));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
}
