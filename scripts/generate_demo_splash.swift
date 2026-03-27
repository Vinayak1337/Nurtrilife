import AppKit
import Foundation

struct DemoPalette {
    let baseTop = NSColor(hex: "#06131F")
    let baseMid = NSColor(hex: "#0A2230")
    let baseBottom = NSColor(hex: "#071824")
    let panel = NSColor(hex: "#112B39")
    let panelSoft = NSColor(hex: "#173746")
    let primary = NSColor(hex: "#18C38C")
    let primaryLight = NSColor(hex: "#64E5BC")
    let accent = NSColor(hex: "#F6A514")
    let text = NSColor(hex: "#F8FBFD")
    let textMuted = NSColor(hex: "#A7BDC8")
    let whiteSoft = NSColor.white.withAlphaComponent(0.08)
    let whiteLine = NSColor.white.withAlphaComponent(0.12)
}

enum DemoError: Error {
    case pngEncodingFailed(URL)
}

let palette = DemoPalette()
let fileManager = FileManager.default
let rootURL = URL(fileURLWithPath: fileManager.currentDirectoryPath)
let outputURL = rootURL.appendingPathComponent("output/imagegen", isDirectory: true)
let splashURL = outputURL.appendingPathComponent("nutrilife-splash-concept.png")
let iconURL = outputURL.appendingPathComponent("nutrilife-icon-concept.png")

try fileManager.createDirectory(at: outputURL, withIntermediateDirectories: true)

try savePNG(to: iconURL, size: CGSize(width: 1024, height: 1024)) {
    drawIconArtwork(in: NSRect(x: 0, y: 0, width: 1024, height: 1024))
}

try savePNG(to: splashURL, size: CGSize(width: 1290, height: 2796)) {
    let canvas = NSRect(x: 0, y: 0, width: 1290, height: 2796)
    drawSplashBackground(in: canvas)
    drawMinimalAtmosphere(in: canvas)
    drawHeroHalo(in: canvas)
    drawBrandIcon(in: NSRect(x: 365, y: 1450, width: 560, height: 560), addPanel: true)

    drawCenteredText(
        "NutriLife",
        font: .systemFont(ofSize: 118, weight: .bold),
        color: palette.text,
        rect: NSRect(x: 0, y: 1180, width: canvas.width, height: 120)
    )

    drawCenteredText(
        "Nutrition Intelligence",
        font: .systemFont(ofSize: 44, weight: .semibold),
        color: palette.textMuted.withAlphaComponent(0.96),
        rect: NSRect(x: 160, y: 1090, width: canvas.width - 320, height: 72)
    )

    drawAccentDivider(in: NSRect(x: 545, y: 1046, width: 200, height: 8))

    drawCenteredText(
        "Scan. Track. Improve.",
        font: .systemFont(ofSize: 52, weight: .medium),
        color: palette.text.withAlphaComponent(0.82),
        rect: NSRect(x: 170, y: 950, width: canvas.width - 340, height: 78)
    )

    drawBottomCaption(in: canvas)
}

print(splashURL.path)
print(iconURL.path)

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
        throw DemoError.pngEncodingFailed(url)
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
        throw DemoError.pngEncodingFailed(url)
    }

    try data.write(to: url)
}

func drawIconArtwork(in rect: NSRect) {
    let basePath = NSBezierPath(roundedRect: rect, xRadius: 232, yRadius: 232)
    let baseGradient = NSGradient(colors: [palette.baseTop, palette.baseMid, palette.baseBottom])!
    baseGradient.draw(in: basePath, angle: -90)

    let glow = NSBezierPath(ovalIn: NSRect(x: 120, y: 360, width: 560, height: 560))
    NSGradient(starting: palette.primary.withAlphaComponent(0.18), ending: .clear)!.draw(in: glow, relativeCenterPosition: .zero)

    let accentGlow = NSBezierPath(ovalIn: NSRect(x: 470, y: 210, width: 360, height: 360))
    NSGradient(starting: palette.accent.withAlphaComponent(0.14), ending: .clear)!.draw(in: accentGlow, relativeCenterPosition: .zero)

    let innerPanel = rect.insetBy(dx: 88, dy: 88)
    let panelPath = NSBezierPath(roundedRect: innerPanel, xRadius: 170, yRadius: 170)
    palette.whiteSoft.setFill()
    panelPath.fill()
    palette.whiteLine.setStroke()
    panelPath.lineWidth = 8
    panelPath.stroke()

    drawBrandMark(in: innerPanel.insetBy(dx: 110, dy: 110), showBrackets: true)
}

func drawSplashBackground(in rect: NSRect) {
    let gradient = NSGradient(colors: [palette.baseTop, palette.baseMid, palette.baseBottom])!
    gradient.draw(from: NSPoint(x: rect.midX, y: rect.maxY), to: NSPoint(x: rect.midX, y: rect.minY), options: [])

    let primaryGlow = NSBezierPath(ovalIn: NSRect(x: -120, y: 1980, width: 850, height: 850))
    NSGradient(starting: palette.primary.withAlphaComponent(0.15), ending: .clear)!.draw(in: primaryGlow, relativeCenterPosition: .zero)

    let accentGlow = NSBezierPath(ovalIn: NSRect(x: 800, y: 1680, width: 560, height: 560))
    NSGradient(starting: palette.accent.withAlphaComponent(0.1), ending: .clear)!.draw(in: accentGlow, relativeCenterPosition: .zero)

    let bottomGlow = NSBezierPath(ovalIn: NSRect(x: 210, y: 40, width: 860, height: 860))
    NSGradient(starting: palette.primary.withAlphaComponent(0.08), ending: .clear)!.draw(in: bottomGlow, relativeCenterPosition: .zero)
}

func drawMinimalAtmosphere(in rect: NSRect) {
    let topRule = NSBezierPath()
    topRule.move(to: NSPoint(x: 290, y: 2290))
    topRule.line(to: NSPoint(x: 1000, y: 2290))
    palette.whiteLine.setStroke()
    topRule.lineWidth = 1.5
    topRule.stroke()

    let bottomRule = NSBezierPath()
    bottomRule.move(to: NSPoint(x: 290, y: 820))
    bottomRule.line(to: NSPoint(x: 1000, y: 820))
    palette.whiteLine.setStroke()
    bottomRule.lineWidth = 1.5
    bottomRule.stroke()

    drawTinySignal(rect: NSRect(x: 214, y: 1880, width: 148, height: 88), accent: palette.primary)
    drawTinySignal(rect: NSRect(x: 928, y: 1880, width: 148, height: 88), accent: palette.accent)
    drawTinySignal(rect: NSRect(x: 236, y: 896, width: 132, height: 80), accent: palette.primaryLight)
    drawTinySignal(rect: NSRect(x: 922, y: 896, width: 132, height: 80), accent: palette.primary)
}

func drawHeroHalo(in rect: NSRect) {
    let outer = NSBezierPath(ovalIn: NSRect(x: 180, y: 1380, width: 930, height: 930))
    palette.whiteLine.setStroke()
    outer.lineWidth = 2.8
    outer.stroke()

    let inner = NSBezierPath(ovalIn: NSRect(x: 272, y: 1472, width: 746, height: 746))
    palette.whiteLine.setStroke()
    inner.lineWidth = 1.8
    inner.setLineDash([8, 16], count: 2, phase: 0)
    inner.stroke()

    let glow = NSBezierPath(ovalIn: NSRect(x: 328, y: 1510, width: 634, height: 634))
    NSGradient(starting: palette.primary.withAlphaComponent(0.14), ending: .clear)!.draw(in: glow, relativeCenterPosition: .zero)
}

func drawBrandIcon(in rect: NSRect, addPanel: Bool) {
    if addPanel {
        let shadow = NSShadow()
        shadow.shadowBlurRadius = 54
        shadow.shadowOffset = NSSize(width: 0, height: -10)
        shadow.shadowColor = NSColor.black.withAlphaComponent(0.26)

        NSGraphicsContext.saveGraphicsState()
        shadow.set()

        let panelRect = rect.insetBy(dx: -18, dy: -18)
        let panelPath = NSBezierPath(roundedRect: panelRect, xRadius: 72, yRadius: 72)
        NSColor.white.withAlphaComponent(0.04).setFill()
        panelPath.fill()
        palette.whiteLine.setStroke()
        panelPath.lineWidth = 3
        panelPath.stroke()

        NSGraphicsContext.restoreGraphicsState()
    }

    let iconRect = NSRect(x: rect.minX, y: rect.minY, width: rect.width, height: rect.height)
    let iconPath = NSBezierPath(roundedRect: iconRect, xRadius: 96, yRadius: 96)
    let iconGradient = NSGradient(colors: [palette.baseTop, palette.panel, palette.baseBottom])!
    iconGradient.draw(in: iconPath, angle: -90)
    palette.whiteLine.setStroke()
    iconPath.lineWidth = 3
    iconPath.stroke()

    let glow = NSBezierPath(ovalIn: iconRect.insetBy(dx: 84, dy: 84))
    NSGradient(starting: palette.primary.withAlphaComponent(0.18), ending: .clear)!.draw(in: glow, relativeCenterPosition: .zero)

    drawBrandMark(in: iconRect.insetBy(dx: 82, dy: 82), showBrackets: true)
}

func drawBrandMark(in rect: NSRect, showBrackets: Bool) {
    let ringRect = rect.insetBy(dx: rect.width * 0.12, dy: rect.height * 0.12)
    let center = NSPoint(x: ringRect.midX, y: ringRect.midY)
    let radius = ringRect.width / 2

    let softRing = NSBezierPath(ovalIn: ringRect.insetBy(dx: 18, dy: 18))
    palette.primaryLight.withAlphaComponent(0.3).setStroke()
    softRing.lineWidth = 10
    softRing.stroke()

    let ring = NSBezierPath(ovalIn: ringRect)
    palette.primary.setStroke()
    ring.lineWidth = 20
    ring.lineCapStyle = .round
    ring.stroke()

    let accentArc = NSBezierPath()
    accentArc.appendArc(withCenter: center, radius: radius, startAngle: 18, endAngle: 74)
    palette.accent.setStroke()
    accentArc.lineWidth = 14
    accentArc.lineCapStyle = .round
    accentArc.stroke()

    let leafPath = NSBezierPath()
    leafPath.move(to: NSPoint(x: center.x + radius * 0.28, y: center.y + radius * 1.05))
    leafPath.curve(
        to: NSPoint(x: center.x + radius * 0.82, y: center.y + radius * 0.64),
        controlPoint1: NSPoint(x: center.x + radius * 0.72, y: center.y + radius * 1.08),
        controlPoint2: NSPoint(x: center.x + radius * 0.94, y: center.y + radius * 0.84)
    )
    leafPath.curve(
        to: NSPoint(x: center.x + radius * 0.28, y: center.y + radius * 1.05),
        controlPoint1: NSPoint(x: center.x + radius * 0.68, y: center.y + radius * 0.48),
        controlPoint2: NSPoint(x: center.x + radius * 0.38, y: center.y + radius * 0.74)
    )
    palette.primaryLight.setFill()
    leafPath.fill()

    let stem = NSBezierPath()
    stem.move(to: NSPoint(x: center.x + radius * 0.52, y: center.y + radius * 0.98))
    stem.line(to: NSPoint(x: center.x + radius * 0.67, y: center.y + radius * 0.73))
    palette.accent.setStroke()
    stem.lineWidth = 6
    stem.lineCapStyle = .round
    stem.stroke()

    let baseline = NSBezierPath(roundedRect: NSRect(x: center.x - radius * 0.52, y: center.y - radius * 0.46, width: radius * 1.04, height: 10), xRadius: 5, yRadius: 5)
    NSColor.white.withAlphaComponent(0.28).setFill()
    baseline.fill()

    let widths = [radius * 0.18, radius * 0.18, radius * 0.18]
    let heights = [radius * 0.42, radius * 0.68, radius * 0.92]
    let colors = [
        NSColor.white.withAlphaComponent(0.86),
        palette.primary,
        palette.accent
    ]
    let gap = radius * 0.12
    let totalWidth = widths.reduce(0, +) + gap * 2
    var currentX = center.x - totalWidth / 2

    for index in 0..<3 {
        let barRect = NSRect(
            x: currentX,
            y: center.y - radius * 0.35,
            width: widths[index],
            height: heights[index]
        )
        let bar = NSBezierPath(roundedRect: barRect, xRadius: widths[index] / 2, yRadius: widths[index] / 2)
        colors[index].setFill()
        bar.fill()
        currentX += widths[index] + gap
    }

    if showBrackets {
        drawScanBrackets(around: ringRect)
    }
}

func drawScanBrackets(around rect: NSRect) {
    let insetRect = rect.insetBy(dx: -rect.width * 0.12, dy: -rect.height * 0.12)
    let length = rect.width * 0.13

    func bracketPath(origin: NSPoint, horizontal: CGFloat, vertical: CGFloat) -> NSBezierPath {
        let path = NSBezierPath()
        path.move(to: origin)
        path.line(to: NSPoint(x: origin.x + length * horizontal, y: origin.y))
        path.move(to: origin)
        path.line(to: NSPoint(x: origin.x, y: origin.y + length * vertical))
        return path
    }

    let combined = NSBezierPath()
    combined.append(bracketPath(origin: NSPoint(x: insetRect.minX, y: insetRect.maxY), horizontal: 1, vertical: -1))
    combined.append(bracketPath(origin: NSPoint(x: insetRect.maxX, y: insetRect.maxY), horizontal: -1, vertical: -1))
    combined.append(bracketPath(origin: NSPoint(x: insetRect.minX, y: insetRect.minY), horizontal: 1, vertical: 1))
    combined.append(bracketPath(origin: NSPoint(x: insetRect.maxX, y: insetRect.minY), horizontal: -1, vertical: 1))

    NSColor.white.withAlphaComponent(0.88).setStroke()
    combined.lineWidth = 8
    combined.lineCapStyle = .round
    combined.lineJoinStyle = .round
    combined.stroke()
}

func drawAccentDivider(in rect: NSRect) {
    let path = NSBezierPath(roundedRect: rect, xRadius: rect.height / 2, yRadius: rect.height / 2)
    let gradient = NSGradient(colors: [
        palette.primary.withAlphaComponent(0.0),
        palette.primary,
        palette.accent,
        palette.accent.withAlphaComponent(0.0)
    ])!
    gradient.draw(in: path, angle: 0)
}

func drawBottomCaption(in rect: NSRect) {
    drawCenteredText(
        "AI-powered calorie and nutrition tracking",
        font: .systemFont(ofSize: 28, weight: .semibold),
        color: palette.textMuted.withAlphaComponent(0.9),
        rect: NSRect(x: 190, y: 346, width: rect.width - 380, height: 44)
    )

    let capsule = NSRect(x: 487, y: 246, width: 316, height: 58)
    let path = NSBezierPath(roundedRect: capsule, xRadius: capsule.height / 2, yRadius: capsule.height / 2)
    NSColor.white.withAlphaComponent(0.055).setFill()
    path.fill()
    palette.whiteLine.setStroke()
    path.lineWidth = 2
    path.stroke()

    let dotRect = NSRect(x: capsule.minX + 20, y: capsule.midY - 6, width: 12, height: 12)
    let dot = NSBezierPath(ovalIn: dotRect)
    palette.primary.setFill()
    dot.fill()

    drawCenteredText(
        "Hybrid AI System",
        font: .systemFont(ofSize: 24, weight: .semibold),
        color: palette.text,
        rect: NSRect(x: capsule.minX + 18, y: capsule.minY + 13, width: capsule.width - 18, height: 32)
    )
}

func drawInfoCard(title: String, value: String, rect: NSRect, accent: NSColor) {
    let path = NSBezierPath(roundedRect: rect, xRadius: 32, yRadius: 32)
    NSColor.white.withAlphaComponent(0.05).setFill()
    path.fill()
    palette.whiteLine.setStroke()
    path.lineWidth = 2
    path.stroke()

    let highlightRect = NSRect(x: rect.minX + 22, y: rect.maxY - 23, width: 84, height: 5)
    let highlight = NSBezierPath(roundedRect: highlightRect, xRadius: 3, yRadius: 3)
    accent.setFill()
    highlight.fill()

    drawLeftAlignedText(
        title.uppercased(),
        font: .systemFont(ofSize: 20, weight: .semibold),
        color: palette.textMuted,
        rect: NSRect(x: rect.minX + 22, y: rect.minY + 88, width: rect.width - 44, height: 28)
    )

    drawLeftAlignedText(
        value,
        font: .systemFont(ofSize: 34, weight: .bold),
        color: palette.text,
        rect: NSRect(x: rect.minX + 22, y: rect.minY + 30, width: rect.width - 44, height: 44)
    )
}

func drawFloatingMiniChart(rect: NSRect, accent: NSColor) {
    let path = NSBezierPath(roundedRect: rect, xRadius: 28, yRadius: 28)
    NSColor.white.withAlphaComponent(0.045).setFill()
    path.fill()
    palette.whiteLine.setStroke()
    path.lineWidth = 2
    path.stroke()

    let chart = NSBezierPath()
    chart.move(to: NSPoint(x: rect.minX + 28, y: rect.minY + 34))
    chart.line(to: NSPoint(x: rect.minX + 76, y: rect.minY + 62))
    chart.line(to: NSPoint(x: rect.minX + 128, y: rect.minY + 54))
    chart.line(to: NSPoint(x: rect.minX + 176, y: rect.minY + 90))
    accent.setStroke()
    chart.lineWidth = 5
    chart.lineCapStyle = .round
    chart.lineJoinStyle = .round
    chart.stroke()
}

func drawTinySignal(rect: NSRect, accent: NSColor) {
    let path = NSBezierPath(roundedRect: rect, xRadius: 24, yRadius: 24)
    NSColor.white.withAlphaComponent(0.04).setFill()
    path.fill()
    palette.whiteLine.setStroke()
    path.lineWidth = 2
    path.stroke()

    let chart = NSBezierPath()
    chart.move(to: NSPoint(x: rect.minX + 22, y: rect.minY + 26))
    chart.line(to: NSPoint(x: rect.minX + 48, y: rect.minY + 46))
    chart.line(to: NSPoint(x: rect.minX + 74, y: rect.minY + 40))
    chart.line(to: NSPoint(x: rect.minX + 110, y: rect.minY + 62))
    accent.setStroke()
    chart.lineWidth = 4.5
    chart.lineCapStyle = .round
    chart.lineJoinStyle = .round
    chart.stroke()
}

func drawCenteredText(_ text: String, font: NSFont, color: NSColor, rect: NSRect) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .center
    paragraph.lineBreakMode = .byWordWrapping

    let attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraph
    ]

    NSAttributedString(string: text, attributes: attributes).draw(in: rect)
}

func drawLeftAlignedText(_ text: String, font: NSFont, color: NSColor, rect: NSRect) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .left
    paragraph.lineBreakMode = .byWordWrapping

    let attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraph
    ]

    NSAttributedString(string: text, attributes: attributes).draw(in: rect)
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
