import AppKit
import Foundation

struct Palette {
    let baseTop = NSColor(hex: "#071522")
    let baseBottom = NSColor(hex: "#0D2735")
    let primary = NSColor(hex: "#10B981")
    let primaryLight = NSColor(hex: "#52E2B5")
    let primarySoft = NSColor(hex: "#BFF6E2")
    let accent = NSColor(hex: "#F59E0B")
    let accentSoft = NSColor(hex: "#FCD34D")
    let ink = NSColor(hex: "#061220")
    let text = NSColor(hex: "#F8FAFC")
    let textMuted = NSColor(hex: "#AFC2CF")
    let stroke = NSColor.white.withAlphaComponent(0.14)
}

enum AssetError: Error {
    case pngEncodingFailed(URL)
}

let palette = Palette()
let fileManager = FileManager.default
let rootURL = URL(fileURLWithPath: fileManager.currentDirectoryPath)
let outputURL = rootURL.appendingPathComponent("assets/images", isDirectory: true)

try fileManager.createDirectory(at: outputURL, withIntermediateDirectories: true)

renderIcon(to: outputURL.appendingPathComponent("icon.png"), size: 1024)
renderAdaptiveBackground(to: outputURL.appendingPathComponent("android-icon-background.png"), size: 512)
renderForeground(to: outputURL.appendingPathComponent("android-icon-foreground.png"), size: 512)
renderMonochrome(to: outputURL.appendingPathComponent("android-icon-monochrome.png"), size: 432)
renderSplash(to: outputURL.appendingPathComponent("splash-icon.png"), size: 1024)
renderIcon(to: outputURL.appendingPathComponent("favicon.png"), size: 48)
renderNotificationIcon(to: outputURL.appendingPathComponent("notification-icon.png"), size: 96)

print("Generated brand assets in \(outputURL.path)")

func renderIcon(to url: URL, size: CGFloat) {
    let canvas = NSRect(x: 0, y: 0, width: size, height: size)
    try? savePNG(to: url, size: canvas.size) {
        drawFullBleedBackground(in: canvas)

        let innerPanel = canvas.insetBy(dx: size * 0.07, dy: size * 0.07)
        let panelPath = NSBezierPath(roundedRect: innerPanel, xRadius: size * 0.18, yRadius: size * 0.18)
        NSColor.white.withAlphaComponent(0.04).setFill()
        panelPath.fill()
        palette.stroke.setStroke()
        panelPath.lineWidth = max(1, size * 0.007)
        panelPath.stroke()

        let markRect = innerPanel.insetBy(dx: size * 0.17, dy: size * 0.17)
        drawMark(in: markRect, monochrome: false, simplified: false)
    }
}

func renderAdaptiveBackground(to url: URL, size: CGFloat) {
    let canvas = NSRect(x: 0, y: 0, width: size, height: size)
    try? savePNG(to: url, size: canvas.size) {
        drawFullBleedBackground(in: canvas)

        let haloRect = canvas.insetBy(dx: size * 0.08, dy: size * 0.08)
        let haloPath = NSBezierPath(roundedRect: haloRect, xRadius: size * 0.18, yRadius: size * 0.18)
        NSColor.white.withAlphaComponent(0.03).setFill()
        haloPath.fill()
        palette.stroke.setStroke()
        haloPath.lineWidth = max(1, size * 0.006)
        haloPath.stroke()
    }
}

func renderForeground(to url: URL, size: CGFloat) {
    let canvas = NSRect(x: 0, y: 0, width: size, height: size)
    try? savePNG(to: url, size: canvas.size) {
        let markRect = canvas.insetBy(dx: size * 0.16, dy: size * 0.16)
        drawMark(in: markRect, monochrome: false, simplified: false)
    }
}

func renderMonochrome(to url: URL, size: CGFloat) {
    let canvas = NSRect(x: 0, y: 0, width: size, height: size)
    try? savePNG(to: url, size: canvas.size) {
        let markRect = canvas.insetBy(dx: size * 0.15, dy: size * 0.15)
        drawMark(in: markRect, monochrome: true, simplified: false)
    }
}

func renderNotificationIcon(to url: URL, size: CGFloat) {
    let canvas = NSRect(x: 0, y: 0, width: size, height: size)
    try? savePNG(to: url, size: canvas.size) {
        let markRect = canvas.insetBy(dx: size * 0.16, dy: size * 0.16)
        drawMark(in: markRect, monochrome: true, simplified: true)
    }
}

func renderSplash(to url: URL, size: CGFloat) {
    let canvas = NSRect(x: 0, y: 0, width: size, height: size)
    try? savePNG(to: url, size: canvas.size) {
        let badgeSize = size * 0.34
        let badgeRect = NSRect(
            x: (size - badgeSize) / 2,
            y: size * 0.47,
            width: badgeSize,
            height: badgeSize
        )

        drawShadowedBadge(in: badgeRect)
        drawMark(in: badgeRect.insetBy(dx: badgeSize * 0.2, dy: badgeSize * 0.2), monochrome: false, simplified: false)

        drawCenteredText(
            "NutriLens",
            font: .systemFont(ofSize: size * 0.103, weight: .bold),
            color: palette.text,
            y: size * 0.28,
            canvasWidth: size
        )

        drawCenteredText(
            "Nutrition Intelligence",
            font: .systemFont(ofSize: size * 0.038, weight: .medium),
            color: palette.textMuted,
            y: size * 0.215,
            canvasWidth: size,
            tracking: size * 0.004
        )

        let dividerWidth = size * 0.18
        let dividerRect = NSRect(x: (size - dividerWidth) / 2, y: size * 0.19, width: dividerWidth, height: max(2, size * 0.0035))
        let dividerPath = NSBezierPath(roundedRect: dividerRect, xRadius: dividerRect.height / 2, yRadius: dividerRect.height / 2)
        NSColor.white.withAlphaComponent(0.12).setFill()
        dividerPath.fill()
    }
}

func savePNG(to url: URL, size: CGSize, draw: () -> Void) throws {
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: Int(size.width),
        pixelsHigh: Int(size.height),
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ) else {
        throw AssetError.pngEncodingFailed(url)
    }

    bitmap.size = size

    NSGraphicsContext.saveGraphicsState()
    if let context = NSGraphicsContext(bitmapImageRep: bitmap) {
        NSGraphicsContext.current = context
        context.cgContext.setShouldAntialias(true)
        context.cgContext.interpolationQuality = .high
        NSColor.clear.setFill()
        NSBezierPath(rect: NSRect(origin: .zero, size: size)).fill()
        draw()
        context.flushGraphics()
    }
    NSGraphicsContext.restoreGraphicsState()

    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw AssetError.pngEncodingFailed(url)
    }

    try data.write(to: url)
}

func drawFullBleedBackground(in rect: NSRect) {
    let backgroundPath = NSBezierPath(rect: rect)
    let backgroundGradient = NSGradient(colors: [palette.baseTop, palette.baseBottom, palette.ink])!
    backgroundGradient.draw(from: NSPoint(x: rect.midX, y: rect.maxY), to: NSPoint(x: rect.midX, y: rect.minY), options: [])

    let emeraldGlow = NSBezierPath(ovalIn: NSRect(
        x: rect.minX + rect.width * 0.08,
        y: rect.minY + rect.height * 0.42,
        width: rect.width * 0.78,
        height: rect.height * 0.78
    ))
    let emeraldGradient = NSGradient(starting: palette.primary.withAlphaComponent(0.22), ending: .clear)!
    emeraldGradient.draw(in: emeraldGlow, relativeCenterPosition: .zero)

    let amberGlow = NSBezierPath(ovalIn: NSRect(
        x: rect.minX + rect.width * 0.44,
        y: rect.minY + rect.height * 0.04,
        width: rect.width * 0.5,
        height: rect.height * 0.5
    ))
    let amberGradient = NSGradient(starting: palette.accent.withAlphaComponent(0.12), ending: .clear)!
    amberGradient.draw(in: amberGlow, relativeCenterPosition: .zero)

    NSColor.white.withAlphaComponent(0.04).setFill()
    backgroundPath.fill()

    let vignette = NSGradient(starting: .clear, ending: NSColor.black.withAlphaComponent(0.22))!
    vignette.draw(from: NSPoint(x: rect.midX, y: rect.maxY), to: NSPoint(x: rect.midX, y: rect.minY), options: [])

    let highlightPath = NSBezierPath(roundedRect: rect.insetBy(dx: rect.width * 0.03, dy: rect.height * 0.03), xRadius: rect.width * 0.09, yRadius: rect.width * 0.09)
    NSColor.white.withAlphaComponent(0.035).setStroke()
    highlightPath.lineWidth = max(1, rect.width * 0.006)
    highlightPath.stroke()
}

func drawShadowedBadge(in rect: NSRect) {
    let shadow = NSShadow()
    shadow.shadowBlurRadius = rect.width * 0.12
    shadow.shadowOffset = NSSize(width: 0, height: -rect.width * 0.03)
    shadow.shadowColor = NSColor.black.withAlphaComponent(0.28)

    NSGraphicsContext.saveGraphicsState()
    shadow.set()

    let badgePath = NSBezierPath(roundedRect: rect, xRadius: rect.width * 0.22, yRadius: rect.width * 0.22)
    let badgeGradient = NSGradient(colors: [palette.baseTop, palette.baseBottom])!
    badgeGradient.draw(in: badgePath, angle: -90)

    NSColor.white.withAlphaComponent(0.08).setStroke()
    badgePath.lineWidth = max(1, rect.width * 0.012)
    badgePath.stroke()

    NSGraphicsContext.restoreGraphicsState()

    let glowPath = NSBezierPath(ovalIn: rect.insetBy(dx: -rect.width * 0.12, dy: -rect.height * 0.12))
    let glowGradient = NSGradient(starting: palette.primary.withAlphaComponent(0.16), ending: .clear)!
    glowGradient.draw(in: glowPath, relativeCenterPosition: .zero)
}

func drawMark(in rect: NSRect, monochrome: Bool, simplified: Bool) {
    let lineColor = monochrome ? NSColor.white : palette.primary
    let accentColor = monochrome ? NSColor.white.withAlphaComponent(0.92) : palette.accent
    let softColor = monochrome ? NSColor.white.withAlphaComponent(0.24) : palette.primarySoft.withAlphaComponent(0.5)
    let whiteColor = monochrome ? NSColor.white : palette.text

    let ringRect = rect.insetBy(dx: rect.width * 0.12, dy: rect.height * 0.12)
    let center = NSPoint(x: ringRect.midX, y: ringRect.midY)
    let radius = ringRect.width / 2
    let outerLine = max(2, rect.width * (simplified ? 0.06 : 0.055))

    let softRing = NSBezierPath(ovalIn: ringRect.insetBy(dx: outerLine * 0.95, dy: outerLine * 0.95))
    softColor.setStroke()
    softRing.lineWidth = max(1.5, outerLine * 0.45)
    softRing.stroke()

    let outerRing = NSBezierPath(ovalIn: ringRect)
    lineColor.setStroke()
    outerRing.lineWidth = outerLine
    outerRing.lineCapStyle = .round
    outerRing.stroke()

    let accentArc = NSBezierPath()
    accentArc.appendArc(withCenter: center, radius: radius, startAngle: 25, endAngle: 82)
    accentColor.setStroke()
    accentArc.lineWidth = outerLine * 0.68
    accentArc.lineCapStyle = .round
    accentArc.stroke()

    let dotRadius = max(2.5, rect.width * 0.035)
    let dotAngle = CGFloat.pi / 4.4
    let dotCenter = NSPoint(
        x: center.x + cos(dotAngle) * radius,
        y: center.y + sin(dotAngle) * radius
    )
    let dotPath = NSBezierPath(ovalIn: NSRect(x: dotCenter.x - dotRadius, y: dotCenter.y - dotRadius, width: dotRadius * 2, height: dotRadius * 2))
    accentColor.setFill()
    dotPath.fill()

    drawBars(in: ringRect, monochrome: monochrome, simplified: simplified, primary: lineColor, accent: accentColor, neutral: whiteColor)

    if !simplified {
        drawBrackets(around: ringRect, monochrome: monochrome ? NSColor.white : whiteColor)
    }
}

func drawBars(in rect: NSRect, monochrome: Bool, simplified: Bool, primary: NSColor, accent: NSColor, neutral: NSColor) {
    let availableWidth = rect.width * 0.44
    let gap = rect.width * (simplified ? 0.035 : 0.045)
    let barWidth = (availableWidth - (gap * 2)) / 3
    let baseY = rect.minY + rect.height * 0.28
    let heights: [CGFloat] = simplified ? [0.23, 0.36, 0.5] : [0.24, 0.4, 0.58]
    let colors: [NSColor] = monochrome
        ? [
            neutral.withAlphaComponent(0.72),
            neutral.withAlphaComponent(0.86),
            neutral
        ]
        : [
            neutral.withAlphaComponent(0.88),
            primary.withAlphaComponent(0.92),
            accent.withAlphaComponent(0.96)
        ]

    let startX = rect.midX - availableWidth / 2

    for (index, heightFactor) in heights.enumerated() {
        let height = rect.height * heightFactor
        let x = startX + CGFloat(index) * (barWidth + gap)
        let barRect = NSRect(x: x, y: baseY, width: barWidth, height: height)
        let path = NSBezierPath(roundedRect: barRect, xRadius: barWidth / 2, yRadius: barWidth / 2)
        colors[index].setFill()
        path.fill()
    }

    let baseRect = NSRect(
        x: startX - barWidth * 0.12,
        y: baseY - rect.height * 0.08,
        width: availableWidth + barWidth * 0.24,
        height: max(2, rect.width * 0.03)
    )
    let basePath = NSBezierPath(roundedRect: baseRect, xRadius: baseRect.height / 2, yRadius: baseRect.height / 2)
    neutral.withAlphaComponent(monochrome ? 0.35 : 0.18).setFill()
    basePath.fill()
}

func drawBrackets(around rect: NSRect, monochrome: NSColor) {
    let insetRect = rect.insetBy(dx: -rect.width * 0.12, dy: -rect.height * 0.12)
    let length = rect.width * 0.12
    let stroke = NSBezierPath()

    func addBracket(origin: NSPoint, horizontal: CGFloat, vertical: CGFloat) {
        stroke.move(to: origin)
        stroke.line(to: NSPoint(x: origin.x + (length * horizontal), y: origin.y))
        stroke.move(to: origin)
        stroke.line(to: NSPoint(x: origin.x, y: origin.y + (length * vertical)))
    }

    addBracket(origin: NSPoint(x: insetRect.minX, y: insetRect.maxY), horizontal: 1, vertical: -1)
    addBracket(origin: NSPoint(x: insetRect.maxX, y: insetRect.maxY), horizontal: -1, vertical: -1)
    addBracket(origin: NSPoint(x: insetRect.minX, y: insetRect.minY), horizontal: 1, vertical: 1)
    addBracket(origin: NSPoint(x: insetRect.maxX, y: insetRect.minY), horizontal: -1, vertical: 1)

    monochrome.withAlphaComponent(0.88).setStroke()
    stroke.lineWidth = max(2, rect.width * 0.034)
    stroke.lineCapStyle = .round
    stroke.lineJoinStyle = .round
    stroke.stroke()
}

func drawCenteredText(_ text: String, font: NSFont, color: NSColor, y: CGFloat, canvasWidth: CGFloat, tracking: CGFloat = 0) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .center

    let attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .kern: tracking,
        .paragraphStyle: paragraph
    ]

    let attributed = NSAttributedString(string: text, attributes: attributes)
    let size = attributed.size()
    let rect = NSRect(x: (canvasWidth - size.width) / 2, y: y, width: size.width, height: size.height)
    attributed.draw(in: rect)
}

extension NSColor {
    convenience init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)

        let red, green, blue, alpha: UInt64
        switch cleaned.count {
        case 6:
            red = (value >> 16) & 0xFF
            green = (value >> 8) & 0xFF
            blue = value & 0xFF
            alpha = 0xFF
        case 8:
            red = (value >> 24) & 0xFF
            green = (value >> 16) & 0xFF
            blue = (value >> 8) & 0xFF
            alpha = value & 0xFF
        default:
            red = 0
            green = 0
            blue = 0
            alpha = 0xFF
        }

        self.init(
            red: CGFloat(red) / 255,
            green: CGFloat(green) / 255,
            blue: CGFloat(blue) / 255,
            alpha: CGFloat(alpha) / 255
        )
    }
}
