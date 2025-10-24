import type { Component, ComponentStyle } from '../../types/builder';
import { Button } from '../ui/button';

interface ComponentRendererProps {
  component: Component;
  isEditing?: boolean;
  onClick?: () => void;
}

const styleToCSS = (style?: ComponentStyle): React.CSSProperties => {
  if (!style) return {};
  return style as React.CSSProperties;
};

export const ComponentRenderer = ({ component, isEditing = false, onClick }: ComponentRendererProps) => {
  const baseStyle = styleToCSS(component.style);
  const wrapperClass = isEditing ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 transition-all' : '';

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  switch (component.type) {
    case 'text':
      return (
        <div className={wrapperClass} style={baseStyle} onClick={handleClick}>
          <p dangerouslySetInnerHTML={{ __html: component.content }} />
        </div>
      );

    case 'heading':
      const HeadingTag = `h${component.level}` as keyof JSX.IntrinsicElements;
      return (
        <div className={wrapperClass} onClick={handleClick}>
          <HeadingTag style={baseStyle} dangerouslySetInnerHTML={{ __html: component.content }} />
        </div>
      );

    case 'image':
      return (
        <div className={wrapperClass} style={baseStyle} onClick={handleClick}>
          <img
            src={component.content.src}
            alt={component.content.alt}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      );

    case 'button':
      return (
        <div className={wrapperClass} style={baseStyle} onClick={handleClick}>
          <Button
            asChild={!isEditing}
            onClick={(e) => isEditing && e.preventDefault()}
          >
            {isEditing ? (
              <span>{component.content.text}</span>
            ) : (
              <a
                href={component.content.link}
                target={component.content.target || '_self'}
              >
                {component.content.text}
              </a>
            )}
          </Button>
        </div>
      );

    case 'video':
      const getEmbedUrl = (url: string, provider: string) => {
        if (provider === 'youtube') {
          const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/)?.[1];
          return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        } else if (provider === 'vimeo') {
          const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
          return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
        }
        return url;
      };

      return (
        <div className={wrapperClass} style={baseStyle} onClick={handleClick}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={getEmbedUrl(component.content.url, component.content.provider)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );

    case 'form':
      return (
        <div className={wrapperClass} style={baseStyle} onClick={handleClick}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isEditing) return;
              // Handle form submission
            }}
            className="space-y-4"
          >
            {component.content.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={isEditing}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    disabled={isEditing}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    required={field.required}
                    disabled={isEditing}
                    className="mr-2"
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={isEditing}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                )}
              </div>
            ))}
            <Button type="submit" disabled={isEditing}>
              {component.content.submitText}
            </Button>
          </form>
        </div>
      );

    case 'spacer':
      return (
        <div
          className={wrapperClass}
          style={{ ...baseStyle, height: component.content.height }}
          onClick={handleClick}
        >
          {isEditing && (
            <div className="h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              Spacer
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};
