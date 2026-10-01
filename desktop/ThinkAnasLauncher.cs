using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("think.anas")]
[assembly: AssemblyDescription("Application de bureau think.anas")]
[assembly: AssemblyProduct("think.anas")]
[assembly: AssemblyCompany("think.anas")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

internal static class ThinkAnasLauncher
{
    [STAThread]
    private static int Main()
    {
        try
        {
            string desktop = AppDomain.CurrentDomain.BaseDirectory;
            string root = Directory.GetParent(desktop.TrimEnd(Path.DirectorySeparatorChar)).FullName;
            string electron = Path.Combine(root, "node_modules", "electron", "dist", "electron.exe");
            string main = Path.Combine(root, "desktop", "main.mjs");

            if (!File.Exists(electron))
            {
                MessageBox.Show(
                    "Electron est introuvable. Réinstallez les dépendances du projet.",
                    "think.anas",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning
                );
                return 1;
            }

            Process child = Process.Start(new ProcessStartInfo
            {
                FileName = electron,
                Arguments = "\"" + main + "\"",
                WorkingDirectory = root,
                UseShellExecute = false,
                CreateNoWindow = true
            });

            if (child != null) child.WaitForExit();
            return child == null ? 1 : child.ExitCode;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "think.anas", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
