#!/usr/bin/env python3
"""
Gerador de preview da interface do Spotify YouTube Player
Usa Pillow para criar uma imagem mockup da UI
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Dimensões
WIDTH = 1200
HEIGHT = 800
SIDEBAR_WIDTH = 280
TITLEBAR_HEIGHT = 32
PLAYERBAR_HEIGHT = 90

# Cores
BLACK = '#000000'
DARK_BG = '#181818'
DARKER_BG = '#121212'
GREEN = '#1db954'
GRAY = '#b3b3b3'
WHITE = '#ffffff'

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_ui_preview():
    # Cria imagem base
    img = Image.new('RGB', (WIDTH, HEIGHT), hex_to_rgb(BLACK))
    draw = ImageDraw.Draw(img)
    
    # Title Bar
    draw.rectangle([(0, 0), (WIDTH, TITLEBAR_HEIGHT)], fill=hex_to_rgb(BLACK))
    draw.line([(0, TITLEBAR_HEIGHT), (WIDTH, TITLEBAR_HEIGHT)], fill=hex_to_rgb(DARKER_BG), width=1)
    
    # Sidebar
    draw.rectangle(
        [(0, TITLEBAR_HEIGHT), (SIDEBAR_WIDTH, HEIGHT - PLAYERBAR_HEIGHT)],
        fill=hex_to_rgb(BLACK)
    )
    draw.line(
        [(SIDEBAR_WIDTH, TITLEBAR_HEIGHT), (SIDEBAR_WIDTH, HEIGHT - PLAYERBAR_HEIGHT)],
        fill=hex_to_rgb(DARKER_BG),
        width=1
    )
    
    # Sidebar items
    y_offset = TITLEBAR_HEIGHT + 40
    
    # Botão ativo (Buscar)
    draw.rounded_rectangle(
        [(20, y_offset), (SIDEBAR_WIDTH - 20, y_offset + 40)],
        radius=6,
        fill=hex_to_rgb(GREEN)
    )
    y_offset += 50
    
    # Botões inativos
    for _ in range(2):
        draw.rounded_rectangle(
            [(20, y_offset), (SIDEBAR_WIDTH - 20, y_offset + 40)],
            radius=6,
            fill=hex_to_rgb(DARKER_BG)
        )
        y_offset += 50
    
    # Playlists section
    y_offset += 40
    for _ in range(5):
        draw.rounded_rectangle(
            [(20, y_offset), (SIDEBAR_WIDTH - 20, y_offset + 32)],
            radius=4,
            fill=hex_to_rgb(DARKER_BG)
        )
        y_offset += 40
    
    # Cache stats at bottom
    cache_y = HEIGHT - PLAYERBAR_HEIGHT - 80
    draw.line(
        [(20, cache_y), (SIDEBAR_WIDTH - 20, cache_y)],
        fill=hex_to_rgb(DARKER_BG),
        width=1
    )
    
    # Main content area
    main_start_x = SIDEBAR_WIDTH
    main_start_y = TITLEBAR_HEIGHT
    main_width = WIDTH - SIDEBAR_WIDTH
    main_height = HEIGHT - TITLEBAR_HEIGHT - PLAYERBAR_HEIGHT
    
    # Gradient background (simulado com retângulos)
    for i in range(main_height):
        gray_value = int(26 - (i / main_height) * 26)  # 26 to 0
        color = (gray_value, gray_value, gray_value)
        draw.line(
            [(main_start_x, main_start_y + i), (WIDTH, main_start_y + i)],
            fill=color
        )
    
    # Search bar
    search_y = main_start_y + 32
    draw.rounded_rectangle(
        [(main_start_x + 32, search_y), (WIDTH - 200, search_y + 48)],
        radius=24,
        fill=hex_to_rgb(DARKER_BG)
    )
    
    # Search button
    draw.rounded_rectangle(
        [(WIDTH - 180, search_y), (WIDTH - 32, search_y + 48)],
        radius=24,
        fill=hex_to_rgb(GREEN)
    )
    
    # Album grid (4x2)
    grid_start_y = search_y + 80
    card_size = 180
    gap = 24
    
    for row in range(2):
        for col in range(4):
            x = main_start_x + 32 + col * (card_size + gap)
            y = grid_start_y + row * (card_size + 120)
            
            # Card background
            draw.rounded_rectangle(
                [(x, y), (x + card_size, y + card_size + 80)],
                radius=8,
                fill=hex_to_rgb(DARK_BG)
            )
            
            # Album art placeholder
            draw.rounded_rectangle(
                [(x + 16, y + 16), (x + card_size - 16, y + card_size - 16)],
                radius=4,
                fill=hex_to_rgb(DARKER_BG)
            )
            
            # Play button overlay (apenas no primeiro)
            if row == 0 and col == 0:
                play_x = x + card_size - 48
                play_y = y + card_size - 48
                draw.ellipse(
                    [(play_x, play_y), (play_x + 48, play_y + 48)],
                    fill=hex_to_rgb(GREEN)
                )
    
    # Player Bar
    player_y = HEIGHT - PLAYERBAR_HEIGHT
    draw.rectangle(
        [(0, player_y), (WIDTH, HEIGHT)],
        fill=hex_to_rgb(DARK_BG)
    )
    draw.line(
        [(0, player_y), (WIDTH, player_y)],
        fill=hex_to_rgb(DARKER_BG),
        width=1
    )
    
    # Album art in player
    art_x = 16
    art_y = player_y + 17
    draw.rounded_rectangle(
        [(art_x, art_y), (art_x + 56, art_y + 56)],
        radius=4,
        fill=hex_to_rgb(DARKER_BG)
    )
    
    # Player controls (center)
    center_x = WIDTH // 2
    center_y = player_y + PLAYERBAR_HEIGHT // 2
    
    # Previous button
    draw.ellipse(
        [(center_x - 80, center_y - 16), (center_x - 48, center_y + 16)],
        fill=hex_to_rgb(DARKER_BG)
    )
    
    # Play button (main)
    draw.ellipse(
        [(center_x - 20, center_y - 20), (center_x + 20, center_y + 20)],
        fill=hex_to_rgb(WHITE)
    )
    
    # Next button
    draw.ellipse(
        [(center_x + 48, center_y - 16), (center_x + 80, center_y + 16)],
        fill=hex_to_rgb(DARKER_BG)
    )
    
    # Volume slider (right side)
    vol_x = WIDTH - 180
    vol_y = center_y
    draw.rounded_rectangle(
        [(vol_x, vol_y - 2), (vol_x + 120, vol_y + 2)],
        radius=2,
        fill=hex_to_rgb(DARKER_BG)
    )
    
    # Volume thumb
    draw.ellipse(
        [(vol_x + 70 - 6, vol_y - 6), (vol_x + 70 + 6, vol_y + 6)],
        fill=hex_to_rgb(WHITE)
    )
    
    # Salva imagem
    output_dir = os.path.join(os.path.dirname(__file__), 'screenshots')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'ui-preview.png')
    img.save(output_path, 'PNG', quality=95)
    
    print(f"✅ Preview gerado: {output_path}")
    return output_path

if __name__ == '__main__':
    create_ui_preview()
    print("\n🎨 Para adicionar texto, instale: pip install pillow")
    print("💡 Execute: python docs/generate_preview.py")