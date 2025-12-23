
"""
Templates for announcements.
Each template provides HTML content for the popup and the email.
"""

def get_standard_template(title, content, version):
    """Standard template using the provided text content."""
    html = f"""
    <div style="font-family: sans-serif; color: #333;">
        <h2>{title}</h2>
        <p>{content}</p>
        {f'<p style="color: #666; font-size: 0.8em;">Version: {version}</p>' if version else ''}
    </div>
    """
    return {
        'popup_html': None,  # Use default text rendering
        'email_html': html
    }

def get_ai_launch_template(title, content, version):
    """Fancy template for the AI launch."""
    
    # Shared style for both (email clients are picky, so inline styles are best)
    style = """
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #e2e8f0;
        padding: 20px;
        border-radius: 10px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        border: 1px solid #38bdf8;
    """
    
    inner_html = f"""
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 40px; margin-bottom: 10px;">🤖</div>
            <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">{title}</h1>
            {f'<div style="color: #94a3b8; font-size: 12px; margin-top: 5px;">{version}</div>' if version else ''}
        </div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #38bdf8;">
            <p style="margin: 0; line-height: 1.6; font-size: 16px;">{content}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
                <strong style="color: #818cf8; display: block; margin-bottom: 5px;">🧠 Context Aware</strong>
                <span style="font-size: 13px; color: #cbd5e1;">Events now remember what happened yesterday.</span>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
                <strong style="color: #34d399; display: block; margin-bottom: 5px;">💬 Community Chatter</strong>
                <span style="font-size: 13px; color: #cbd5e1;">Citizens now discuss and debate the daily crisis.</span>
            </div>
        </div>
    """
    
    full_html = f"""
    <div style="{style}">
        {inner_html}
    </div>
    """
    
    return {
        'popup_html': full_html,
        'email_html': full_html
    }

TEMPLATES = {
    'standard': {
        'name': 'Standard (Text)',
        'generator': get_standard_template
    },
    'ai_launch': {
        'name': 'AI Launch Special',
        'generator': get_ai_launch_template
    }
}
