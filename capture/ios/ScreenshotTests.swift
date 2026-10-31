import XCTest

// shot-butcher capture template. Copy into your UI test target and edit `shots`.
// Each shot launches the app straight into one screen with demo data, using launch arguments
// your app reads in DEBUG builds (for example "-ShotButcherScreen inbox"), and attaches a
// full-screen screenshot named after the slot id. capture/ios/capture.sh exports them.
final class ShotButcherTests: XCTestCase {
    // slot id (matches set.json) -> extra launch arguments that open that screen.
    let shots: [(id: String, args: [String])] = [
        ("01-welcome", ["-ShotButcherScreen", "welcome"]),
        ("02-main", ["-ShotButcherScreen", "main"]),
    ]

    @MainActor
    func testCaptureStoreScreens() throws {
        for shot in shots {
            let app = XCUIApplication()
            app.launchArguments += ["-ShotButcher", "1"] + shot.args
            app.launch()
            // Let animations and image loading settle; prefer waiting for a known element when you can.
            sleep(2)
            let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
            attachment.name = shot.id
            attachment.lifetime = .keepAlways
            add(attachment)
            app.terminate()
        }
    }
}
