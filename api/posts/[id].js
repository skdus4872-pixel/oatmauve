const { redis } = require('../../lib/redis');
const { matchesPost } = require('../../lib/password');

const ORDER_KEY = 'board:order';
const CATEGORIES = ['공지사항', '상품 사용후기', '상품 Q&A', '이용안내 FAQ', '교환/반품 문의'];

module.exports = async (req, res) => {
  const { id } = req.query;
  const key = `board:post:${id}`;

  if (req.method === 'GET') {
    const post = await redis.hgetall(key);
    if (!post || !post.id) return res.status(404).json({ error: '글을 찾을 수 없습니다.' });

    const views = (Number(post.views) || 0) + 1;
    await redis.hset(key, { views });

    const { salt, passwordHash, ...safePost } = post;
    safePost.views = views;
    return res.status(200).json({ post: safePost });
  }

  const post = await redis.hgetall(key);
  if (!post || !post.id) return res.status(404).json({ error: '글을 찾을 수 없습니다.' });

  if (req.method === 'PUT') {
    const { password, title, content, nickname, category } = req.body || {};
    if (!matchesPost(password, post)) {
      return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
    }
    const updated = {
      ...post,
      title: title ? String(title).slice(0, 200) : post.title,
      content: content ? String(content).slice(0, 5000) : post.content,
      nickname: nickname ? String(nickname).slice(0, 40) : post.nickname,
      category: CATEGORIES.includes(category) ? category : post.category,
      updatedAt: Date.now(),
    };
    await redis.hset(key, updated);

    const { salt, passwordHash, ...safePost } = updated;
    return res.status(200).json({ post: safePost });
  }

  if (req.method === 'DELETE') {
    const { password } = req.body || {};
    if (!matchesPost(password, post)) {
      return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
    }
    await redis.del(key);
    await redis.zrem(ORDER_KEY, id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method Not Allowed' });
};
