'use client';

export default function FontPreview() {
  const fonts = [
    { name: 'Caveat', label: '当前使用 - Caveat' },
    { name: 'Indie Flower', label: 'Indie Flower' },
    { name: 'Shadows Into Light', label: 'Shadows Into Light' },
    { name: 'Patrick Hand', label: 'Patrick Hand' },
    { name: 'Kalam', label: 'Kalam' },
    { name: 'Permanent Marker', label: 'Permanent Marker' },
  ];

  const sampleText = 'Write down your confusion... Tell me about yourself...';

  return (
    <div style={{ padding: '2rem', background: '#fefdf5' }}>
      <h1 style={{ marginBottom: '2rem', fontFamily: 'system-ui' }}>
        手写字体预览
      </h1>
      {fonts.map((font) => (
        <div
          key={font.name}
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'white',
            borderRadius: '8px',
            border: '2px solid #ddd',
          }}
        >
          <div
            style={{
              fontFamily: 'system-ui',
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '0.5rem',
            }}
          >
            {font.label}
          </div>
          <div
            style={{
              fontFamily: `'${font.name}', cursive`,
              fontSize: '1.5rem',
              color: '#2c1810',
            }}
          >
            {sampleText}
          </div>
        </div>
      ))}
    </div>
  );
}
