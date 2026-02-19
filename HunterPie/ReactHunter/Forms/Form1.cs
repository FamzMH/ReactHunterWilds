using System;
using System.Windows.Forms;

namespace HunterPie.ReactHunter.Forms;

public partial class Form1 : Form
{

    private readonly System.Windows.Application application;

    public Form1(System.Windows.Application application)
    {
        InitializeComponent();
        this.application = application;
    }

    private void Form1_Load(object sender, EventArgs e)
    {
        Text = "React Hunter Returns";

        Console.SetOut(new TextBoxWriter(textBox1));
    }

    private async void Form1_Shown(object sender, EventArgs e)
    {
        Console.WriteLine("Waiting for game to load");
    }

    private void Form1_Closing(object sender, FormClosingEventArgs e)
    {
        application.Shutdown();
    }

}
